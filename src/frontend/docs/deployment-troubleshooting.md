# Deployment Troubleshooting Guide

This guide covers common issues when deploying the Vision Galaxy Society app to the Internet Computer mainnet.

## Prerequisites Checklist

Before deploying, verify:

- [ ] **dfx installed**: Run `dfx --version` (requires 0.15.0+)
- [ ] **Identity configured**: Run `dfx identity whoami`
- [ ] **Cycles available**: Ensure your identity has cycles or a wallet configured
- [ ] **Project built**: Run `pnpm install` from project root
- [ ] **Network connectivity**: Stable internet connection to IC mainnet

## Pre-Deployment Checks

### Cycles/Wallet Readiness Check

The deployment helper (`frontend/deploy/ic-deploy-with-retry.sh`) performs an automatic readiness check before attempting deployment. This check verifies:

1. **dfx is installed and available**
2. **A dfx identity is configured**
3. **A wallet is configured for IC mainnet**
4. **The wallet balance can be read and is sufficient**

#### What happens when the check fails

If any readiness check fails, the script will:
- Print the specific issue detected
- Provide exact commands to diagnose the problem
- Exit without attempting deployment

#### Manual verification commands

If you need to manually verify your cycles/wallet configuration:

