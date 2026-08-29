"""Launch IISTA's three isolated backend processes on ports 8000–8002."""
import os, signal, subprocess, sys, time
from cryptography.hazmat.primitives import serialization
from app.crypto import make_key, public_pem

ROOT = os.path.dirname(__file__)
agent_key = make_key()
store_key = make_key()
dae_key = make_key()
def private_pem(key): return key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()).decode()
private = private_pem(agent_key)
base = os.environ | {"PYTHONPATH": ROOT, "IISTA_STORE_URL": "http://127.0.0.1:8000", "IISTA_DAE_URL": "http://127.0.0.1:8002"}
store_env = base | {"IISTA_STORE_PRIVATE_KEY": private_pem(store_key), "IISTA_DAE_PUBLIC_KEY": public_pem(dae_key)}
dae_env = base | {"IISTA_AGENT_PUBLIC_KEY": public_pem(agent_key), "IISTA_STORE_PUBLIC_KEY": public_pem(store_key), "IISTA_DAE_PRIVATE_KEY": private_pem(dae_key)}
agent_env = base | {"IISTA_AGENT_PRIVATE_KEY": private}
commands = [("app.mock_store:app", "8000", store_env), ("app.dae:app", "8002", dae_env), ("app.agent:app", "8001", agent_env)]
gateway_env = base | {"IISTA_AGENT_URL": "http://127.0.0.1:8001", "IISTA_DAE_URL": "http://127.0.0.1:8002"}
commands.append(("app.main:app", "8003", gateway_env))
processes = [subprocess.Popen([sys.executable, "-m", "uvicorn", target, "--port", port], cwd=ROOT, env=env) for target, port, env in commands]
try:
    print("IISTA backend running: Gateway 8003, Store 8000, Agent 8001, DAE 8002")
    while True: time.sleep(1)
except KeyboardInterrupt: pass
finally:
    for process in processes: process.send_signal(signal.SIGTERM)
    for process in processes: process.wait()
