"""Port-free end-to-end verification of the three IISTA FastAPI services."""
import asyncio, importlib, os, copy
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
from app.crypto import canonical, sha256, sign

def pem(key):
    return key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()).decode()
def pub(key):
    return key.public_key().public_bytes(serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo).decode()

agent_key, store_key, dae_key = (ec.generate_private_key(ec.SECP256K1()) for _ in range(3))
os.environ.update({"IISTA_AGENT_PRIVATE_KEY":pem(agent_key),"IISTA_AGENT_PUBLIC_KEY":pub(agent_key),"IISTA_STORE_PRIVATE_KEY":pem(store_key),"IISTA_STORE_PUBLIC_KEY":pub(store_key),"IISTA_DAE_PRIVATE_KEY":pem(dae_key),"IISTA_DAE_PUBLIC_KEY":pub(dae_key)})
from app import agent, dae, mock_store
importlib.reload(mock_store); importlib.reload(dae); importlib.reload(agent)
import httpx
ORIGINAL = httpx.AsyncClient
class LocalClient:
    def __init__(self, timeout=5): self.timeout=timeout
    async def __aenter__(self): return self
    async def __aexit__(self,*args): return None
    async def _request(self, method, url, **kwargs):
        app = {8000:mock_store.app,8001:agent.app,8002:dae.app}[int(url.split(':')[2].split('/')[0])]
        path='/' + url.split('/',3)[3] if url.count('/') >= 3 else '/'
        async with ORIGINAL(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            return await client.request(method,path,**kwargs)
    async def get(self,url,**kwargs): return await self._request('GET',url,**kwargs)
    async def post(self,url,**kwargs): return await self._request('POST',url,**kwargs)
httpx.AsyncClient=LocalClient

async def post(app,path,payload):
    async with ORIGINAL(transport=httpx.ASGITransport(app=app),base_url='http://test') as c: return await c.post(path,json=payload)
async def main():
    outcomes={}
    for scenario, expected in (("standard",True),("injection",False),("toctou",False)):
        mock_store.cart_price=20
        r=await post(agent.app,"/run",{"scenario":scenario}); outcomes[scenario]=(r.status_code,r.json())
        assert r.json()["authorized"] is expected, r.text
    mock_store.cart_price=20
    r=await post(agent.app,"/run",{"scenario":"deviation"}); outcomes['deviation']=(r.status_code,r.json()); assert not r.json()['authorized']
    good=outcomes['standard'][1]
    tampered=copy.deepcopy(good['graph']); tampered[0]['output']['price']=200
    r=await post(dae.app,"/authorize",{"intent":{"budget":25,"domain":"mockstore.local"},"graph":tampered}); assert r.status_code==403 and 'hash' in r.json()['detail']
    substitution=copy.deepcopy(outcomes['standard'][1]['graph']); substitution[-1]['witness_proof']['signature']='AAAA'
    node=substitution[-1]; unsigned={k:node[k] for k in ("tool","params","output","witness_proof","domain","prev_hash")}
    node["node_hash"]=sha256(bytes.fromhex(node["prev_hash"]),canonical(unsigned)).hex(); node["agent_signature"]=sign(agent_key,bytes.fromhex(node["node_hash"]))
    r=await post(dae.app,"/authorize",{"intent":{"budget":25,"domain":"mockstore.local"},"graph":substitution}); assert r.status_code==403 and 'merchant' in r.json()['detail']
    tx=good['payment']
    # Store must reject a transaction not carrying a valid DAE authorization envelope.
    r=await post(mock_store.app,"/payment",{"transaction":{"amount":20},"signature":"AAAA","transaction_public_key":pub(agent_key),"dae_attestation_signature":"AAAA"}); assert r.status_code==403
    for name, (_, data) in outcomes.items(): print(name, data['authorized'], data.get('reason','paid'))
    print('tampered_graph blocked; merchant_substitution blocked; unauthorized_signing blocked')
asyncio.run(main())
