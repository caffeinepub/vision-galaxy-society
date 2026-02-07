# IC Mainnet Deployment Guide

This guide explains how to deploy your application to the Internet Computer mainnet so it becomes publicly accessible.

## Prerequisites

Before deploying, ensure you have:

1. **dfx installed** (version 0.15.0 or higher)
   ```bash
   dfx --version
   ```
   If not installed: https://internetcomputer.org/docs/current/developer-docs/setup/install

2. **Node.js and pnpm installed**
   ```bash
   node --version
   pnpm --version
   ```

3. **dfx identity configured**
   ```bash
   dfx identity whoami
   ```
   If no identity exists:
   ```bash
   dfx identity new my-identity
   dfx identity use my-identity
   ```

4. **Cycles wallet configured for IC mainnet** with sufficient balance
   ```bash
   dfx identity get-wallet --network ic
   dfx wallet balance --network ic
   ```
   If you need cycles: https://internetcomputer.org/docs/current/developer-docs/setup/cycles/cycles-faucet

## Quick Start: Deploy Your Live Application

Follow these steps to deploy your application to the Internet Computer mainnet and make it publicly accessible:

### 1. Navigate to Project Root

