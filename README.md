# Sworn

Authorization infrastructure for autonomous agents. An AI buyer can search a catalog, fill a cart, and finish checkout in the browser. Settlement only runs after a separate verifier checks sealed policy, execution-graph integrity, a merchant-signed invoice, and a live price oracle at commit time.

[Open the live demo](https://sworn-enclave.vercel.app) · [Merchant store](https://sworn-enclave.vercel.app/store/orders) · [Incident Lab](https://sworn-enclave.vercel.app/lab) · [API](#api-surface)

Razorpay AI Buildathon · Track 05 · Open Track · open source

## why open track

I picked Open Track because Sworn did not start as a feature brief. I kept running into the same question while reading about NPCI's Unified Agent Protocol, Razorpay's agentic payment pilots with NPCI and OpenAI, and the in-app commerce work with Zomato and Swiggy: once an agent can complete checkout inside a conversation, what actually decides that the debit is allowed?

That question does not map cleanly onto a single hackathon prompt. It is not "build a recovery bot" or "score fraud on a dataset." It is infrastructure: compile intent before the run, record what the agent did, re-check merchant state at commit time, sign or refuse. I wanted room to build that properly instead of bending it into a narrower demo.

Open Track also matches how I want this repo to live after the buildathon. Public code, runnable locally, something a payments engineer can fork and wire to real APIs. The named tracks are useful framing. Sworn is the layer underneath them.

## what this gives razorpay

Razorpay is already moving from processing payments to running them through agents. Agent Studio deploys autonomous workflows on top of Razorpay data. The Agentic Experience Platform turns onboarding and reconciliation into conversations. Merchant pilots put discovery, decision, and pay inside the same in-app thread. NPCI's UAP work points the same direction at national scale: registered agents, spending ceilings, audit trails, and verification before a UPI debit fires.

All of that needs the same missing piece: **a trust boundary between "the agent finished checkout" and "Razorpay should settle."** Today that boundary is mostly policy text and hope. Sworn makes it mechanical.

Concretely, this repo is a working sketch of what Razorpay could put upstream of a charge:

- **Sealed spend limits** before the agent runs (budget, merchant scope, allowed tools), aligned with how UAP and Reserve Pay talk about bounded delegation.
- **An execution graph** the agent cannot rewrite after the fact, so support and risk teams have something stronger than chat logs when a transaction is disputed.
- **Commit-time price oracle** so a stale cart quote cannot become a settled charge (TOCTOU is not theoretical once agents shop over minutes, not seconds).
- **A DAE-signed payment envelope** the store or gateway verifies before calling settlement, the hook where Razorpay's payment APIs would sit in a production wiring.

Sworn does not replace Razorpay's rails. It is the authorization gate in front of them. Processors settle what passed verification. The agent never holds the signing key.

That is why I think this is the right problem for a Razorpay buildathon, even on Open Track. Razorpay's next decade of agent products will fail or succeed on whether merchants and regulators trust autonomous debits. This project shows that trust can be engineered: bounded, explainable, testable, and open source in this repository. The Incident Lab is six proofs that the gate closes when it should.

## what is inside

- A FastAPI backend split across four isolated services: agent executor, DAE, API gateway, and mock merchant store.
- Sealed Intent Structure (SSI): budget, domain, and tool allowlist compiled before the agent starts. Nothing in the run can rewrite it.
- An append-only execution graph. Each tool call is a secp256k1-attested node linked by SHA-256. Change a node and the chain fails verification.
- A Deterministic Authorization Engine (DAE) that holds the master secret, re-reads merchant price at commit time, and signs the payment envelope or returns 403.
- Northbridge Cloud, a mock merchant with JSON catalog, signed invoices, cart/checkout, oracle endpoint, and order history.
- A live autonomous path: natural-language intent on the landing page, paced run console, post-run report, and merchant order on success.
- Incident Lab with six attacks: prompt injection (live autonomous run), TOCTOU, path deviation, history tampering, proof substitution, unauthorized signing.
- A hash-chained event log on the gateway for every run.

## architecture

```
                         +------------------+
                         |   Next.js UI     |
                         |  (Vercel)        |
                         +--------+---------+
                                  | /api/*  /store/*
                                  v
                         +------------------+
                         |  serve.py proxy  |
                         |  (Railway $PORT) |
                         +--------+---------+
                    +-----+--------+-----+
                    |     |        |     |
                    v     v        v     v
              +---------+ +---+ +-----+ +----------------+
              | Gateway | |Agt| | DAE | | Mock merchant  |
              |  :8003  | |:01| | :02 | | store :8000    |
              +---------+ +---+ +-----+ +----------------+
                    |       |     |            ^
                    |       +-----+------------+
                    |             authorize + oracle
                    +---- hash-chained run events
```

| Component | Can browse / propose | Can sign payments |
|-----------|---------------------|-------------------|
| Agent executor | Yes | No (attestation key only) |
| DAE | No | Yes (master secret + identity key) |
| Merchant store | Issues signed invoices | Accepts only DAE-attested envelopes |
| Gateway | Orchestrates runs | Never touches signing keys |

Backend modules use the name IISTA internally. The product surface is Sworn.

## request flow

1. User submits intent on the landing page. Gateway extracts budget from the prompt (regex, default $25), calls DAE `/intent`, seals policy, writes the first events to the log.
2. Agent runs a LangGraph workflow: search, view product, add to cart, checkout, read invoice. Each step appends an attested graph node and publishes events to the gateway.
3. DAE `/authorize` validates the graph, SSI domain and tool allowlist, merchant witness signature, invoice price against budget, and oracle price against invoice price.
4. On pass, DAE derives a path-bound transaction key and signs the payment envelope. Store `/payment` checks DAE attestation and amount. On fail, status is `blocked` and settlement is zero.
5. Gateway records `payment_settled` or `authorization_blocked`. Merchant writes the order. UI shows the run report.

The agent can reach "checkout complete" in the browser. Settlement does not follow from that alone.

## try it

**Successful purchase**

1. Open [sworn-enclave.vercel.app](https://sworn-enclave.vercel.app).
2. Click **Try it**, or send: *Find me a basic VPS under $25 and purchase it from the approved marketplace.*
3. Follow the run console through payment authorized and purchase complete.
4. Open [Orders](https://sworn-enclave.vercel.app/store/orders) for the paid line item and transaction id.
5. Read the run report at the bottom of the run page for policy, checks, and graph tip hash.

**Blocked purchase (prompt injection)**

1. Open [Incident Lab](https://sworn-enclave.vercel.app/lab).
2. Run **Prompt injection**. The agent is influenced by malicious listing copy and selects a $200 plan.
3. DAE blocks against the $25 seal. Settled amount stays $0. Block reason is shown in the lab UI.

The other five lab scenarios run as scripted backend paths and return specific 403 messages from the DAE or store.

## stack

| Layer | Implementation |
|-------|----------------|
| Console | Next.js 14.2, React 18, TypeScript, Tailwind CSS, Framer Motion |
| API gateway | FastAPI, hash-chained event log, run lifecycle |
| Agent | FastAPI, LangGraph, Playwright-capable browser controller |
| DAE | FastAPI, secp256k1, HKDF-derived transaction keys (DPKD) |
| Merchant | FastAPI mock store + HTML storefront |
| Crypto | SHA-256 hash chains, ECDSA witnesses, pinned public keys |
| Deploy | Vercel (console) + Railway (backend Docker image) |

## repository map

```
backend/
  run.py              Launch gateway :8003, store :8000, agent :8001, DAE :8002
  serve.py            Production proxy on $PORT (Railway entrypoint)
  Dockerfile          python:3.12-slim, uvicorn serve:app
  railway.toml        Railway deploy config
  app/
    main.py           Gateway, runs, events, policy normalization
    agent.py          Autonomous agent + LangGraph scenarios
    dae.py            Authorization engine
    mock_store.py     Merchant, oracle, payment, orders
    crypto.py         Execution graph, SSI, DPKD, signatures
    store_ui.py       HTML store pages
  tests/
    test_crypto.py    Graph validation + tamper rejection
    run_direct.py     End-to-end scenario matrix

frontend-v2/
  app/                / landing, /lab, /run/[runId], /blog
  components/         Landing, live console, incident lab, report
  lib/                API client, event reducer, incidents, narrative
  hooks/              Live run polling, paced narrative, incident runs
```

## run locally

**Prerequisites:** Node.js 18+, Python 3.12+, npm

**1. Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

You should see:

```
IISTA backend running: Gateway 8003, Store 8000, Agent 8001, DAE 8002
```

**2. Console**

```bash
cd frontend-v2
npm install
npm run dev
```

Open http://localhost:3000. Next.js rewrites `/api/*` to port 8003 and `/store/*` to port 8000 (`frontend-v2/next.config.mjs`).

**3. Smoke checks**

```bash
curl http://127.0.0.1:8003/health

curl -s -X POST http://127.0.0.1:8003/api/run \
  -H 'content-type: application/json' \
  -d '{"scenario":"injection","budget":25,"domain":"mockstore.local"}'

cd backend && PYTHONPATH=. python -m pytest tests/ -q
PYTHONPATH=. python tests/run_direct.py
```

## API surface

### Gateway (port 8003, proxied at `/api/*`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Service health |
| POST | `/api/runs` | Create run from natural-language prompt |
| POST | `/api/runs/{id}/start` | Start autonomous execution |
| POST | `/api/runs/{id}/cancel` | Cancel in-flight run |
| GET | `/api/runs/{id}` | Run status and result |
| GET | `/api/runs/{id}/events?after=N` | Hash-chained event stream |
| POST | `/api/run` | Direct scenario execution (lab / tests) |
| POST | `/api/intent` | Compile SSI preview |

### Merchant store (port 8000, proxied at `/store/*`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/products` | Catalog JSON |
| POST | `/checkout` | Signed invoice witness |
| GET | `/oracle/{invoice_id}` | Commit-time price |
| POST | `/payment` | Settle with DAE-attested envelope |
| GET | `/orders` | Order history (HTML) |
| POST | `/api/orders/finalize/{run_id}` | Finalize run-scoped order |

Full route lists: `backend/app/main.py`, `backend/app/mock_store.py`.

## incident lab

| # | Attack | Mode | What blocks |
|---|--------|------|-------------|
| 01 | Prompt injection | Live autonomous | Invoice $200 over $25 seal |
| 02 | TOCTOU price mutation | Scenario | Oracle price != invoice at commit |
| 03 | Path deviation | Scenario | Domain outside SSI allowlist |
| 04 | History tampering | Scenario | Broken execution graph hash chain |
| 05 | Proof substitution | Scenario | Invalid merchant witness signature |
| 06 | Unauthorized signing | Scenario | Store rejects bad DAE attestation |

Definitions: `frontend-v2/lib/incidents.ts`. Backends: `backend/app/agent.py`, `backend/tests/run_direct.py`.

## what broke in production

After deploy, the run UI showed purchase complete but `/store/orders` stayed empty and order detail returned `unknown order`.

`serve.py` was forwarding every `/api/*` path to the gateway. Store routes like `/api/orders/finalize/{run_id}` never hit the merchant process. Local dev worked because Next.js sends `/store/*` straight to port 8000.

Fix: route only `/api/runs`, `/api/run`, and `/health` to the gateway; send merchant `/api/*` to the store. Write orders on payment so the merchant page updates without a separate finalize hop. Confirmed on the live deploy after Railway redeploy.

## a note on razorpay

Sworn sits upstream of settlement. The processor should only see charges that passed DAE verification. This repo uses a mock merchant with signed invoices and simulated payment, not Razorpay test-mode APIs wired in yet. The envelope shape (sealed intent, attested path, commit-time verify, signed authorization) is where a Razorpay charge call would attach.

Landing badge: *Sealed spend for Razorpay.* Longer writeups: `frontend-v2/lib/blog/posts.ts`.

## build and test

```bash
cd frontend-v2 && npm run build

cd backend && PYTHONPATH=. python -m pytest tests/ -q
PYTHONPATH=. python tests/run_direct.py
```

`run_direct.py` covers standard (authorize), injection, toctou, and deviation (block), plus tampered graph, forged witness, and bad payment envelope at the store.

## deploy

**Console · Vercel**

- Root directory: `frontend-v2`
- Set `BACKEND_URL` to your Railway backend URL (no trailing slash) for Production
- `next.config.mjs` rewrites `/api/*` and `/store/*` to that host

**Backend · Railway**

- Build from `backend/Dockerfile` via `railway.toml`
- Start command: `uvicorn serve:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`
- `serve.py` starts `run.py` internally and splits gateway vs store traffic

Public demo: [sworn-enclave.vercel.app](https://sworn-enclave.vercel.app). Cold start on Railway can take 20–30 seconds after idle.

## safety boundary

Sworn is a prototype. It does not move real money. Mock-store settlement is for evaluation only. DAE and merchant keys on the public demo are ephemeral.

## apply

| Field | Value |
|-------|-------|
| Track | 05 · Open Track |
| Project | Sworn |
| Repo | this repository (public, open source) |
| Live | https://sworn-enclave.vercel.app |
| What broke | Production store API routing (see above) |

[Razorpay AI Buildathon · Apply](https://razorpay.com/buildathon)
