"""Typed, allowlisted browser adapter for the local commerce site.

Playwright is used when installed; the HTTP adapter keeps the prototype runnable
in minimal environments while preserving the same action/result contract.
"""
from __future__ import annotations
import os
import httpx

ALLOWED_DOMAIN = os.getenv("IISTA_COMMERCE_DOMAIN", "mockstore.local")
STORE_URL = os.getenv("IISTA_STORE_URL", "http://127.0.0.1:8000")
TOOLS = {"search_products", "view_product", "add_to_cart", "checkout", "read_invoice"}

class BrowserController:
    def __init__(self, run_id: str, session_id: str | None = None):
        self.run_id = run_id
        self.session_id = session_id
        self.mode = "http-fallback"
        self._pw = self._browser = self._page = None
    async def start(self):
        if os.getenv("IISTA_DISABLE_PLAYWRIGHT", "").lower() in {"1", "true", "yes"}:
            self.mode = "http-fallback"
            return
        try:
            from playwright.async_api import async_playwright
            self._pw = await async_playwright().start(); self._browser = await self._pw.chromium.launch(headless=True)
            self._page = await self._browser.new_page(); self.mode = "playwright"
            await self._page.goto(STORE_URL + "/", wait_until="domcontentloaded")
        except Exception:
            self.mode = "http-fallback"
    async def call(self, tool: str, **params):
        if tool not in TOOLS: raise ValueError("browser tool is not allowlisted")
        if self._page is None: await self.start()
        if self._page is not None:
            if tool == "search_products":
                await self._page.goto(STORE_URL + "/products?query=" + params.get("query", "VPS") + "&run_id=" + self.run_id); output = (await self._page.locator("body").inner_text())
                import json; output = {"products": json.loads(output)["products"]}
            elif tool == "view_product":
                await self._page.goto(f"{STORE_URL}/product/{params['product_id']}?run={self.run_id}")
                price_el = self._page.locator("[data-price]")
                if await price_el.count():
                    price = await price_el.first.get_attribute("data-price")
                else:
                    async with httpx.AsyncClient(timeout=5) as c:
                        r = await c.get(f"{STORE_URL}/products/{params['product_id']}")
                        r.raise_for_status()
                        price = str(r.json()["product"]["price"])
                output = {"product_id": params["product_id"], "price": int(price) if price else None}
            elif tool == "add_to_cart":
                await self._page.goto(STORE_URL + "/product/" + params["product_id"])
                async with httpx.AsyncClient(timeout=5) as c: r = await c.post(f"{STORE_URL}/cart/{self.run_id}", json={"product_id": params["product_id"], "quantity": 1}); r.raise_for_status(); output = r.json()
            elif tool == "checkout":
                await self._page.goto(STORE_URL + "/checkout")
                payload = {"product_id": params["product_id"], "run_id": self.run_id}
                if self.session_id:
                    payload["session_id"] = self.session_id
                async with httpx.AsyncClient(timeout=5) as c:
                    r = await c.post(f"{STORE_URL}/checkout", json=payload)
                    r.raise_for_status()
                    output = r.json()
            else:
                async with httpx.AsyncClient(timeout=5) as c: r = await c.get(f"{STORE_URL}/api/invoice/{params['invoice_id']}"); r.raise_for_status(); output = r.json()
            return {"tool": tool, "domain": ALLOWED_DOMAIN, "url": self._page.url, "output": output}
        async with httpx.AsyncClient(timeout=5) as c:
            if tool == "search_products": r = await c.get(f"{STORE_URL}/products", params={"query": params.get("query", "VPS"), "run_id": self.run_id})
            elif tool == "view_product": r = await c.get(f"{STORE_URL}/products/{params['product_id']}")
            elif tool == "add_to_cart": r = await c.post(f"{STORE_URL}/cart/{self.run_id}", json={"product_id": params["product_id"], "quantity": 1})
            elif tool == "checkout":
                payload = {"product_id": params["product_id"], "run_id": self.run_id}
                if self.session_id:
                    payload["session_id"] = self.session_id
                r = await c.post(f"{STORE_URL}/checkout", json=payload)
            else: r = await c.get(f"{STORE_URL}/api/invoice/{params['invoice_id']}")
            r.raise_for_status(); return {"tool": tool, "domain": ALLOWED_DOMAIN, "url": str(r.url), "output": r.json()}
