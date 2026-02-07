# Deployment Troubleshooting Guide

This guide covers common issues when deploying to the Internet Computer mainnet.

## Prerequisites Checklist

Before deploying, verify:

- [ ] **dfx installed**: Run `dfx --version` (requires 0.15.0+)
- [ ] **Identity configured**: Run `dfx identity whoami`
- [ ] **Cycles available**: Ensure your identity has cycles or a wallet configured
- [ ] **Project built**: Run `pnpm install` and `pnpm run build` from project root
- [ ] **Network connectivity**: Stable internet connection to IC mainnet
- [ ] **Running from project root**: Verify `dfx.json` exists in current directory

## Pre-Deployment Checks

### Cycles/Wallet Readiness Check

The deployment helper (`frontend/deploy/ic-deploy-with-retry.sh`) performs an automatic readiness check before attempting deployment. This check verifies:

1. **dfx is installed and available**
2. **A dfx identity is configured**
3. **A cycles wallet is configured for IC mainnet**
4. **The wallet has sufficient cycles balance**

If any of these checks fail, the script will provide specific guidance on how to resolve the issue.

### Manual Verification Commands

You can manually verify your deployment readiness with these commands:

