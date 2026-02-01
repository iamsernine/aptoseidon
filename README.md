# Aptoseidon

Crypto risk analysis app: frontend (React + Vite) + backend (FastAPI). Connect wallet, run pre-check, unlock AI report via x402, rate with ERC-8004.

## Run the app

You need **both** servers running.

### 1. Backend (port 8000)

```bash
cd aptoseidon-backend
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend (port 3000)

In a **second terminal**:

```bash
cd aptoseidon-frontend
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser. The frontend talks to the backend via the Vite proxy.

---

## If you see these errors

| Error | Cause | What to do |
|-------|--------|------------|
| **GET http://localhost:3000/ 404** | Nothing is serving the app on port 3000. | Start the **frontend**: `cd aptoseidon-frontend` then `npm run dev`. Open **http://localhost:3000** (not 8000). |
| **CSP blocking .well-known/com.chrome.devtools.json** | A **browser extension** (e.g. security/privacy) is injecting a strict Content Security Policy. | Not from Aptoseidon. Disable that extension for localhost or use an Incognito window. |
| **share-modal.js addEventListener on null** | A **browser extension** (e.g. share/social) is injecting a script that expects a DOM element that doesn’t exist. | Not from Aptoseidon. Ignore or disable the extension. |
| **403 permission error / content.js** | A **browser extension** (e.g. password manager, “site integration”) is calling its own API and getting 403. | Not from Aptoseidon. Ignore or disable the extension. |

- **Backend only** → http://localhost:8000 shows JSON (`{"service":"Aptoseidon","status":"ok"}`). That is the API, not the UI.
- **Frontend only** → http://localhost:3000 shows the Aptoseidon UI; API calls are proxied to the backend (backend must be on 8000).
