# Specification

## Summary
**Goal:** Redeploy the current app version to the Internet Computer mainnet (network: `ic`) and provide clear deployment outputs (live URL + frontend canister ID), with failure logging, classification, and remediation steps when deployment fails.

**Planned changes:**
- Run the existing retry-based IC mainnet deployment workflow to complete a successful `dfx deploy --network ic`.
- Ensure deployment output clearly includes the frontend canister ID and a live frontend URL (`VITE_CANONICAL_APP_URL` if set, otherwise `https://<frontend_canister_id>.ic0.app`).
- If deployment fails, capture full stdout/stderr logs per attempt under `frontend/deploy/logs`, classify the failure (canister reservation/creation vs generic), and provide aligned remediation steps (including pre-creating canisters and rerunning deploy-with-retry, or pointing to deployment troubleshooting docs).

**User-visible outcome:** The app is live on IC mainnet with a shared URL, and deployment results include the frontend canister ID; if deployment fails, there are saved logs plus clear next steps to resolve and redeploy.
