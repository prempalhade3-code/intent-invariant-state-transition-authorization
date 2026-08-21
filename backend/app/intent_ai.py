"""Optional model-assisted intent normalization; authorization never depends on the model."""
import os
from openai import AsyncOpenAI

async def normalize_intent(text: str, fallback_budget: int, fallback_domain: str) -> dict:
    """Use GPT-4o-mini only when configured; DAE still compiles and enforces the SSI."""
    if not os.environ.get("OPENAI_API_KEY"):
        return {"budget": fallback_budget, "domain": fallback_domain, "source": "deterministic-fallback"}
    client = AsyncOpenAI()
    response = await client.chat.completions.create(model="gpt-4o-mini", response_format={"type":"json_object"},
        messages=[{"role":"system","content":"Extract only budget (integer) and domain from user intent as JSON."},{"role":"user","content":text}])
    return {**__import__("json").loads(response.choices[0].message.content or "{}"), "source":"gpt-4o-mini"}
