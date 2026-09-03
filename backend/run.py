"""Launch IISTA's isolated backend processes on ports 8000–8003."""
import os
import signal
import subprocess
import sys
import time

from bootstrap_env import provision

ROOT = os.path.dirname(__file__)
provision(force=True)

agent_env = os.environ.copy()
commands = [
    ("app.mock_store:app", "8000", agent_env),
    ("app.dae:app", "8002", agent_env),
    ("app.agent:app", "8001", agent_env),
    ("app.main:app", "8003", agent_env),
]
processes = []
for target, port, env in commands:
    process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", target, "--host", "127.0.0.1", "--port", port],
        cwd=ROOT,
        env=env,
    )
    processes.append((target, process))
    time.sleep(0.35)

for target, process in processes:
    if process.poll() is not None:
        raise SystemExit(f"{target} failed to start (exit {process.returncode})")

processes = [process for _, process in processes]
try:
    print("IISTA backend running: Gateway 8003, Store 8000, Agent 8001, DAE 8002")
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    pass
finally:
    for process in processes:
        process.send_signal(signal.SIGTERM)
    for process in processes:
        process.wait()
