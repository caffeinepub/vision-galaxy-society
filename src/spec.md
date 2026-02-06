# Specification

## Summary
**Goal:** Improve IC mainnet deployment helper tooling by adding retry support for transient failures and a pre-deployment cycles/wallet readiness check with clear operator guidance.

**Planned changes:**
- Add or extend a deployment helper script under `frontend/deploy/` to retry `dfx deploy --network ic` for a configurable number of attempts with a configurable delay, with clear console output per attempt.
- Detect/handle the known "CaLM permanent canister reservation failed" error by printing the recommended next steps (including pre-creating canisters) and continuing according to the configured retry behavior.
- When retries are exhausted, exit with a non-zero code and print a concise summary including the last failure reason and where to find troubleshooting documentation.
- Add a pre-deployment cycles/wallet readiness check step (automated or explicitly prompted) before running the deploy command.
- If cycles/wallet readiness cannot be verified automatically, print exact commands the operator can run to verify wallet/cycles configuration and balance, then abort safely with a non-zero exit code.
- Update documentation with an English-only section describing the cycles readiness check and remediation steps when cycles are missing/insufficient.

**User-visible outcome:** Operators can run a single helper flow to deploy to IC mainnet that (1) checks cycles/wallet readiness before deploying and (2) retries failed deployments with clear guidance and a final failure summary if all attempts fail.
