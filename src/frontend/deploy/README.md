# IC Mainnet Deployment Helper Tools

This directory contains helper scripts to make deploying to the Internet Computer mainnet more reliable and user-friendly.

## Overview

The deployment helper tooling provides:
- **Automatic cycles/wallet readiness check** before deployment
- **Configurable retry logic** with automatic failure detection
- **Clear, actionable guidance** when deployment fails
- **Deterministic retry path** via canister pre-creation for CaLM failures

## Scripts

### `ic-deploy-with-retry.sh`

Main deployment wrapper that runs `dfx deploy --network ic` with enhanced error detection, pre-deployment checks, and configurable retry logic.

**Features:**
- Pre-deployment cycles/wallet readiness verification
- Automatic retry on failure with configurable attempts and delay
- CaLM failure detection with specific remediation steps
- Detailed logging of each attempt
- Clear summary when all retries are exhausted

**Usage:**

