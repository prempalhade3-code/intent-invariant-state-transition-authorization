"""Polished HTML templates for the Northbridge Cloud store."""
from datetime import datetime, timezone
from html import escape
from typing import Any
from zoneinfo import ZoneInfo

STORE_NAME = "Northbridge Cloud"
STORE_TAGLINE = "Approved Marketplace · VPS Infrastructure"
STORE_PREFIX = "/store"
IST = ZoneInfo("Asia/Kolkata")

FONT_LINK = (
    '<link rel="preconnect" href="https://fonts.googleapis.com"/>'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>'
    '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600&display=swap" rel="stylesheet"/>'
)

BASE_CSS = """
:root {
  --bg: #ffffff;
  --surface: #f8f9fb;
  --surface-2: #f1f3f6;
  --ink: #4a5060;
  --ink-strong: #5c6370;
  --muted: #9aa0ab;
  --line: #e8eaef;
  --line-strong: #d8dce4;
  --radius: 14px;
  --radius-sm: 10px;
  --shadow: 0 1px 2px rgba(74, 80, 96, 0.04), 0 8px 32px rgba(74, 80, 96, 0.06);
  --font-sans: "Space Grotesk", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --page-x: clamp(28px, 5vw, 72px);
  --page-y: clamp(32px, 4vh, 56px);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; }
body {
  font-family: var(--font-sans);
  background: var(--bg);
  color: var(--ink);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}
a { color: var(--ink-strong); text-decoration: none; transition: color .15s; }
a:hover { color: var(--ink); text-decoration: none; }

.site-header {
  position: sticky; top: 0; z-index: 40;
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}
.header-inner {
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 18px var(--page-x);
  max-width: none;
}
.logo {
  font-size: 17px; font-weight: 600; color: var(--ink-strong);
  letter-spacing: -0.03em; line-height: 1.25;
}
.logo span {
  display: block; margin-top: 2px;
  font-size: 12px; font-weight: 400; color: var(--muted);
  letter-spacing: 0.01em;
}
nav { display: flex; gap: 28px; align-items: center; font-size: 14px; font-weight: 500; }
nav a { color: var(--muted); padding: 6px 0; border-bottom: 2px solid transparent; }
nav a:hover { color: var(--ink-strong); }
nav a.active { color: var(--ink-strong); border-bottom-color: var(--line-strong); }

.page { padding: var(--page-y) var(--page-x) 80px; width: 100%; max-width: none; }
.page-hero {
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--line);
}
.page-hero h1 {
  font-size: clamp(28px, 3.2vw, 40px);
  font-weight: 600; letter-spacing: -0.04em;
  color: var(--ink-strong); margin-bottom: 10px;
}
.subtitle { color: var(--muted); font-size: 15px; max-width: 52ch; }

.back-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 12px; color: var(--muted);
  margin-bottom: 28px;
}
.back-link:hover { color: var(--ink-strong); }

.search-bar {
  width: 100%; max-width: 480px;
  padding: 14px 18px; margin-top: 28px;
  border: 1px solid var(--line); border-radius: var(--radius-sm);
  font-family: var(--font-sans); font-size: 15px; color: var(--ink-strong);
  background: var(--surface);
  outline: none; transition: border-color .15s, box-shadow .15s;
}
.search-bar:focus {
  border-color: var(--line-strong);
  box-shadow: 0 0 0 3px rgba(74, 80, 96, 0.06);
}
.search-bar::placeholder { color: var(--muted); }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: 20px;
  width: 100%;
}
.card {
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow);
  transition: border-color .18s, transform .18s, box-shadow .18s;
  height: 100%;
  display: flex; flex-direction: column;
}
.card:hover {
  border-color: var(--line-strong);
  transform: translateY(-2px);
  box-shadow: 0 4px 24px rgba(74, 80, 96, 0.08);
}
.card h2 {
  font-size: 18px; font-weight: 600; letter-spacing: -0.02em;
  color: var(--ink-strong); margin-bottom: 8px;
}
.card .cat {
  font-family: var(--font-mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: .12em;
  color: var(--muted); margin-bottom: 12px;
}
.card .desc {
  font-size: 14px; color: var(--muted);
  margin-bottom: 20px; line-height: 1.6; flex: 1;
}
.card .price {
  font-size: 26px; font-weight: 600; letter-spacing: -0.03em;
  color: var(--ink-strong); margin-top: auto;
}
.card .price small { font-size: 14px; font-weight: 400; color: var(--muted); }

.split-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 380px);
  gap: 32px; align-items: start;
}
@media (max-width: 900px) {
  .split-layout { grid-template-columns: 1fr; }
}

.panel {
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 28px 32px;
  box-shadow: var(--shadow);
  width: 100%;
}
.panel-wide { max-width: none; }
.panel-stack { display: flex; flex-direction: column; gap: 0; }

.row {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
  padding: 16px 0; border-bottom: 1px solid var(--line);
  font-size: 14px;
}
.row:last-child { border-bottom: none; }
.row > div:first-child { color: var(--muted); font-size: 13px; }
.row > div:last-child { color: var(--ink-strong); font-weight: 500; text-align: right; }
.row-total {
  font-size: 18px; font-weight: 600; letter-spacing: -0.02em;
  border-top: 2px solid var(--line-strong) !important;
  margin-top: 8px; padding-top: 20px !important;
}
.row-total > div { color: var(--ink-strong) !important; }

.mono {
  font-family: var(--font-mono);
  font-size: 12px; color: var(--muted); line-height: 1.5;
}

.badge {
  display: inline-flex; align-items: center;
  padding: 4px 10px; border-radius: 999px;
  font-family: var(--font-mono); font-size: 10px;
  font-weight: 500; letter-spacing: .06em;
  text-transform: uppercase;
  background: var(--surface-2); color: var(--muted);
  border: 1px solid var(--line);
}
.status-paid {
  font-family: var(--font-mono); font-size: 11px;
  font-weight: 500; letter-spacing: .08em;
  text-transform: uppercase; color: var(--ink-strong);
  background: var(--surface-2); padding: 4px 10px;
  border-radius: 999px; border: 1px solid var(--line);
}
.cart-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 6px;
  border-radius: 999px; font-family: var(--font-mono);
  font-size: 11px; font-weight: 500;
  background: var(--surface-2); color: var(--ink-strong);
  border: 1px solid var(--line); margin-left: 4px;
}

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 12px 22px; border-radius: var(--radius-sm);
  font-family: var(--font-sans); font-size: 14px; font-weight: 500;
  border: none; cursor: pointer; transition: background .15s, border-color .15s;
}
.btn-primary {
  background: var(--ink-strong); color: #fff;
}
.btn-primary:hover { background: var(--ink); color: #fff; }
.btn-ghost {
  background: transparent; border: 1px solid var(--line);
  color: var(--ink-strong);
}
.btn-ghost:hover { border-color: var(--line-strong); background: var(--surface); }

.specs { display: flex; gap: 8px; flex-wrap: wrap; margin: 20px 0; }
.spec {
  font-family: var(--font-mono); font-size: 11px;
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 999px; padding: 6px 12px; color: var(--muted);
}

.fulfillment { display: flex; gap: 10px; margin-top: 28px; flex-wrap: wrap; }
.step {
  font-family: var(--font-mono); font-size: 11px;
  padding: 8px 14px; border-radius: 999px;
  background: var(--surface); color: var(--muted);
  border: 1px solid var(--line);
}
.step.done { background: var(--surface-2); color: var(--ink-strong); }
.step.current { background: var(--bg); color: var(--ink-strong); border-color: var(--line-strong); }

.empty {
  text-align: center; padding: 80px 24px;
  border: 1px dashed var(--line); border-radius: var(--radius);
  background: var(--surface);
}
.empty h2 { font-size: 20px; font-weight: 600; color: var(--ink-strong); margin-bottom: 8px; }
.empty p { color: var(--muted); font-size: 15px; }

.invoice-note {
  margin-top: 24px; padding: 20px 22px;
  background: var(--surface); border-radius: var(--radius-sm);
  border: 1px solid var(--line);
}
.invoice-note p { font-size: 13px; color: var(--muted); margin-top: 8px; line-height: 1.55; }

.order-list { display: flex; flex-direction: column; gap: 14px; width: 100%; }
.order-card { text-decoration: none; color: inherit; }
.order-card .row { border: none; padding: 0; align-items: center; }
.order-card .row > div:first-child { color: inherit; font-size: inherit; }
.order-card strong { font-size: 16px; color: var(--ink-strong); display: block; margin-bottom: 6px; }

.product-price-lg {
  font-size: clamp(32px, 4vw, 40px);
  font-weight: 600; letter-spacing: -0.04em;
  color: var(--ink-strong); margin: 24px 0;
}
.product-price-lg small { font-size: 16px; font-weight: 400; color: var(--muted); }

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px; margin-top: 24px;
}
.detail-tile {
  padding: 16px 18px; background: var(--surface);
  border: 1px solid var(--line); border-radius: var(--radius-sm);
}
.detail-tile .label { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
.detail-tile .value { font-family: var(--font-mono); font-size: 13px; color: var(--ink-strong); word-break: break-all; }

.actions { margin-top: 28px; display: flex; gap: 12px; flex-wrap: wrap; }
"""


def _format_time(iso: str | None) -> str:
    if not iso:
        return ""
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        local = dt.astimezone(IST)
        return local.strftime("%b %d, %Y · %I:%M %p IST")
    except ValueError:
        return iso


def _href(path: str = "", run_qs: str = "") -> str:
    path = path.strip("/")
    url = f"{STORE_PREFIX}/{path}" if path else f"{STORE_PREFIX}/"
    if run_qs:
        url += f"?run={escape(run_qs)}"
    return url


def _layout(title: str, body: str, nav_active: str = "", cart_count: int = 0, run_qs: str = "") -> str:
    catalog_link = _href("", run_qs)
    cart_link = _href("cart", run_qs)
    orders_link = _href("orders")
    cart_badge = f'<span class="cart-badge">{cart_count}</span>' if cart_count else ""

    nav_items = [
        ("catalog", catalog_link, "Catalog"),
        ("cart", cart_link, f"Cart{cart_badge}"),
        ("orders", orders_link, "Orders"),
    ]
    nav_html = ""
    for key, href, label in nav_items:
        active = ' class="active"' if nav_active == key else ""
        nav_html += f'<a href="{href}"{active}>{label}</a>'

    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>{escape(title)} · {STORE_NAME}</title>
  {FONT_LINK}
  <style>{BASE_CSS}</style>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a href="{catalog_link}" class="logo">{STORE_NAME}<span>{STORE_TAGLINE}</span></a>
      <nav>{nav_html}</nav>
    </div>
  </header>
  <main class="page">{body}</main>
</body>
</html>"""


def render_catalog(products: list[dict[str, Any]], query: str = "", run_qs: str = "", cart_count: int = 0) -> str:
    run_param = f"&run={escape(run_qs)}" if run_qs else ""
    run_qs_js = escape(run_qs) if run_qs else ""
    cards = ""
    for p in products:
        link = _href(f"product/{escape(p['id'])}", run_qs)
        cards += f"""
        <a href="{link}" class="card">
          <div class="cat">{escape(p['category'])}</div>
          <h2>{escape(p['name'])}</h2>
          <p class="desc">{escape(p['description'][:140])}</p>
          <div class="price">${p['price']}<small>/mo</small></div>
        </a>"""
    body = f"""
    <div class="page-hero">
      <h1>VPS Infrastructure</h1>
      <p class="subtitle">Compute instances from approved marketplace merchants. Browse plans, compare specs, and check out through your authorized agent.</p>
      <input class="search-bar" id="search" placeholder="Search VPS plans…" value="{escape(query)}"/>
    </div>
    <div class="grid" id="catalog">{cards}</div>
    <script>
    const q=document.getElementById('search');
    q.addEventListener('input', async () => {{
      const url='{STORE_PREFIX}/products?query='+encodeURIComponent(q.value)+'{run_param}';
      const d=await fetch(url).then(r=>r.json());
      const runQs='{run_qs_js}';
      document.getElementById('catalog').innerHTML=d.products.map(p=>`
        <a href="{STORE_PREFIX}/product/${{p.id}}${{runQs ? '?run=' + runQs : ''}}" class="card">
          <div class="cat">${{p.category}}</div><h2>${{p.name}}</h2>
          <p class="desc">${{p.description.substring(0,140)}}</p>
          <div class="price">$${{p.price}}<small>/mo</small></div>
        </a>`).join('');
    }});
    </script>"""
    return _layout("Catalog", body, "catalog", cart_count, run_qs)


def render_product(product: dict[str, Any], run_qs: str = "", cart_count: int = 0) -> str:
    body = f"""
    <a href="{_href('', run_qs)}" class="back-link">← Back to catalog</a>
    <div class="split-layout">
      <div>
        <div class="cat" style="font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-bottom:12px">{escape(product['category'])}</div>
        <h1 style="font-size:clamp(28px,3vw,36px);font-weight:600;letter-spacing:-0.04em;color:var(--ink-strong);margin-bottom:16px">{escape(product['name'])}</h1>
        <div class="specs">
          <span class="spec">{escape(product['merchant_id'])}</span>
          <span class="spec">{product['inventory']} in stock</span>
          <span class="spec">{escape(product['domain'])}</span>
        </div>
        <p style="color:var(--muted);font-size:15px;line-height:1.65;max-width:56ch">{escape(product['description'])}</p>
      </div>
      <div class="panel">
        <div class="mono" style="margin-bottom:12px">Monthly plan</div>
        <div class="product-price-lg" data-price="{product['price']}" data-product-id="{escape(product['id'])}">${product['price']}<small>/mo</small></div>
        <p style="font-size:13px;color:var(--muted);line-height:1.55">Billed through Sworn authorization. Your agent cannot exceed the sealed budget at checkout.</p>
      </div>
    </div>"""
    return _layout(product["name"], body, "", cart_count, run_qs)


def render_cart(items: list[dict[str, Any]], products: list[dict[str, Any]], run_qs: str = "") -> str:
    if not items:
        body = f"""<div class="empty"><h2>Your cart is empty</h2><p>Add a VPS plan from the catalog to continue.</p>
        <div class="actions" style="justify-content:center;margin-top:24px"><a href="{_href('', run_qs)}" class="btn btn-primary">Browse catalog</a></div></div>"""
        return _layout("Cart", body, "cart", 0, run_qs)

    rows = ""
    total = 0
    for i in items:
        prod = next((p for p in products if p["id"] == i["product_id"]), None)
        name = prod["name"] if prod else i["product_id"]
        sub = i["price"] * i["quantity"]
        total += sub
        rows += f'<div class="row"><div><strong style="color:var(--ink-strong)">{escape(name)}</strong><div class="mono">Qty {i["quantity"]}</div></div><div>${sub}</div></div>'

    body = f"""
    <div class="page-hero">
      <h1>Cart</h1>
      <p class="subtitle">{len(items)} item{'s' if len(items) != 1 else ''} ready for checkout</p>
    </div>
    <div class="split-layout">
      <div class="panel panel-wide panel-stack">{rows}
        <div class="row row-total"><div>Total</div><div>${total}</div></div>
      </div>
      <div class="panel">
        <div class="mono" style="margin-bottom:12px">Summary</div>
        <p style="font-size:14px;color:var(--muted);line-height:1.6;margin-bottom:20px">Proceed to checkout to issue a merchant-signed invoice. Payment requires Sworn authorization.</p>
        <a href="{_href('checkout', run_qs)}" class="btn btn-primary" style="width:100%">Proceed to checkout</a>
      </div>
    </div>"""
    return _layout("Cart", body, "cart", len(items), run_qs)


def render_checkout(items: list[dict[str, Any]], products: list[dict[str, Any]], invoice: dict[str, Any] | None, run_qs: str = "") -> str:
    if not items:
        body = """<div class="empty"><h2>Nothing to check out</h2><p>Your cart is empty.</p></div>"""
        return _layout("Checkout", body, "cart", 0, run_qs)

    rows = ""
    total = 0
    for i in items:
        prod = next((p for p in products if p["id"] == i["product_id"]), None)
        name = prod["name"] if prod else i["product_id"]
        sub = i["price"] * i["quantity"]
        total += sub
        rows += f'<div class="row"><div>{escape(name)}</div><div>${sub}</div></div>'

    inv_block = ""
    if invoice:
        inv_link = _href(f"invoice/{escape(invoice['invoice_id'])}")
        inv_block = f"""
        <div class="invoice-note">
          <div class="mono">{escape(invoice['invoice_id'])}</div>
          <p>Merchant-signed invoice · awaiting Sworn authorization before payment settles.</p>
          <a href="{inv_link}" style="font-size:13px;margin-top:12px;display:inline-block;color:var(--ink-strong)">View invoice →</a>
        </div>"""

    body = f"""
    <div class="page-hero">
      <h1>Checkout</h1>
      <p class="subtitle">Review your order before payment authorization</p>
    </div>
    <div class="panel panel-wide">
      {rows}
      <div class="row row-total"><div>Amount due</div><div>${total}</div></div>
      {inv_block}
    </div>"""
    return _layout("Checkout", body, "cart", len(items), run_qs)


def render_invoice(invoice: dict[str, Any], product: dict[str, Any] | None, paid: bool = False, tx_id: str = "") -> str:
    name = product["name"] if product else invoice.get("product_id", "")
    status = '<span class="status-paid">Paid</span>' if paid else '<span class="badge">Pending</span>'
    tx_tile = ""
    if tx_id:
        tx_tile = f"""
        <div class="detail-tile">
          <div class="label">Transaction</div>
          <div class="value">{escape(tx_id)}</div>
        </div>"""
    body = f"""
    <div class="page-hero">
      <h1>Invoice</h1>
      <p class="subtitle mono">{escape(invoice['invoice_id'])}</p>
    </div>
    <div class="panel panel-wide">
      <div class="row"><div>Product</div><div>{escape(name)}</div></div>
      <div class="row"><div>Amount</div><div>${invoice['price']}</div></div>
      <div class="row"><div>Merchant</div><div>{escape(invoice.get('merchant_id', ''))}</div></div>
      <div class="row"><div>Domain</div><div class="mono">{escape(invoice.get('domain', ''))}</div></div>
      <div class="row"><div>Status</div><div>{status}</div></div>
    </div>
    <div class="detail-grid">
      <div class="detail-tile">
        <div class="label">Invoice ID</div>
        <div class="value">{escape(invoice['invoice_id'])}</div>
      </div>
      {tx_tile}
    </div>"""
    return _layout("Invoice", body, "orders", 0, invoice.get("run_id", ""))


def render_orders(orders_list: list[dict[str, Any]], products: list[dict[str, Any]], today: str = "") -> str:
    if not orders_list:
        body = """<div class="empty"><h2>No orders yet</h2><p>Completed purchases from today will appear here after Sworn authorizes payment.</p></div>"""
        return _layout("Orders", body, "orders", 0)

    sorted_orders = sorted(
        orders_list,
        key=lambda o: o.get("created_at") or "",
        reverse=True,
    )
    rows = ""
    for order in sorted_orders:
        prod = next((p for p in products if p["id"] == order["product_id"]), None)
        name = prod["name"] if prod else order["product_id"]
        link = _href(f"order/{escape(order['order_id'])}")
        placed = _format_time(order.get("created_at"))
        run_line = f'<div class="mono">Run {escape(order.get("run_id", "—"))}</div>' if order.get("run_id") else ""
        time_line = f'<div class="mono">{escape(placed)}</div>' if placed else ""
        rows += f"""
        <a href="{link}" class="card order-card">
          <div class="row">
            <div><strong>{escape(name)}</strong><div class="mono">{escape(order['order_id'])}</div>{time_line}{run_line}</div>
            <div style="text-align:right"><div style="font-size:18px;font-weight:600;color:var(--ink-strong);margin-bottom:8px">${order['price']}</div><span class="status-paid">{escape(order['status'].upper())}</span></div>
          </div>
        </a>"""

    count_label = f"{len(sorted_orders)} order{'s' if len(sorted_orders) != 1 else ''}"
    day_label = f"today · {today}" if today else "today"
    body = f"""
    <div class="page-hero">
      <h1>Orders</h1>
      <p class="subtitle">{count_label} · {day_label}</p>
    </div>
    <div class="order-list">{rows}</div>"""
    return _layout("Orders", body, "orders", 0)


def render_order(order: dict[str, Any], product: dict[str, Any] | None, invoice: dict[str, Any] | None) -> str:
    name = product["name"] if product else order.get("product_id", "")
    inv_link = _href(f"invoice/{escape(invoice['invoice_id'])}") if invoice else "#"
    placed = _format_time(order.get("created_at"))
    inv_row = ""
    if invoice:
        inv_row = f'<div class="row"><div>Invoice</div><div><a href="{inv_link}" class="mono">{escape(invoice["invoice_id"])}</a></div></div>'
    body = f"""
    <a href="{_href('orders')}" class="back-link">← Back to orders</a>
    <div class="page-hero" style="margin-bottom:28px;padding-bottom:24px">
      <h1>{escape(name)}</h1>
      <p class="subtitle mono">{escape(order['order_id'])}</p>
    </div>
    <div class="split-layout">
      <div class="panel panel-wide panel-stack">
        <div class="row"><div>Amount paid</div><div>${order['price']}</div></div>
        <div class="row"><div>Status</div><div><span class="status-paid">{escape(order['status'].upper())}</span></div></div>
        {f'<div class="row"><div>Placed</div><div class="mono">{escape(placed)}</div></div>' if placed else ''}
        <div class="row"><div>Transaction</div><div class="mono">{escape(order.get('transaction_id', ''))}</div></div>
        <div class="row"><div>Run</div><div class="mono">{escape(order.get('run_id', '—'))}</div></div>
        {inv_row}
      </div>
      <div class="panel">
        <div class="mono" style="margin-bottom:16px">Fulfillment</div>
        <div class="fulfillment" style="margin-top:0;flex-direction:column;align-items:stretch">
          <span class="step done">Paid</span>
          <span class="step current">Provisioning</span>
          <span class="step">Active</span>
        </div>
      </div>
    </div>"""
    return _layout("Order", body, "orders", 0, order.get("run_id", ""))
