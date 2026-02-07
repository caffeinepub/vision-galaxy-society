# Specification

## Summary
**Goal:** Improve IC mainnet deployment failure diagnostics and retry guidance so developers can quickly identify causes and take the correct next steps when app creation fails.

**Planned changes:**
- Update the deployment helper output to include a dedicated “generic failure” section that points to the saved log location, prints the last relevant error lines, and links to a local troubleshooting doc path.
- Add/expand local troubleshooting documentation to include the symptom text “Application creation unsuccessful” and provide concrete checks/commands (dfx version, identity, wallet, cycles balance, pre-create canisters, retry deploy), written in English only.
- Enhance the retry workflow to detect canister reservation/creation failures (including CaLM-related patterns) and prominently instruct running `./frontend/deploy/ic-precreate-canisters.sh` before the next retry (and optionally perform it when a safe non-interactive mode is enabled, if implemented).
- Ensure retry attempts continue saving per-attempt logs to a deterministic location and printing that location at script completion, without regressing successful deploy output (frontend URL/canister ID).

**User-visible outcome:** When a deploy fails with generic “Application creation unsuccessful” messaging, developers see clearer diagnostics (log path + relevant error tail) and a direct troubleshooting path; when canister reservation/creation issues are detected, the retry flow guides (and optionally automates) pre-creating canisters to reduce repeated failures.
