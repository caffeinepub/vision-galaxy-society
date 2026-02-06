#!/bin/bash
# IC Mainnet Deployment Helper with Retry Mode and Cycles Check
# This script wraps dfx deploy --network ic with configurable retry logic and pre-deployment checks

set -e

# Configuration (can be overridden via environment variables)
MAX_RETRIES="${MAX_RETRIES:-3}"
RETRY_DELAY="${RETRY_DELAY:-30}"

# Parse command-line flags
while [[ $# -gt 0 ]]; do
    case $1 in
        --max-retries)
            MAX_RETRIES="$2"
            shift 2
            ;;
        --retry-delay)
            RETRY_DELAY="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --max-retries N    Maximum number of deployment attempts (default: 3)"
            echo "  --retry-delay N    Seconds to wait between retries (default: 30)"
            echo "  --help             Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  MAX_RETRIES        Same as --max-retries"
            echo "  RETRY_DELAY        Same as --retry-delay"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Run with --help for usage information"
            exit 1
            ;;
    esac
done

echo "🚀 IC Mainnet Deployment with Retry Mode"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Configuration:"
echo "  Max retries: $MAX_RETRIES"
echo "  Retry delay: ${RETRY_DELAY}s"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==================== Pre-deployment Cycles/Wallet Readiness Check ====================

echo "🔍 Step 1: Checking cycles/wallet readiness..."
echo ""

# Check if dfx is available
if ! command -v dfx &> /dev/null; then
    echo "❌ Error: dfx command not found"
    echo ""
    echo "Please install dfx: https://internetcomputer.org/docs/current/developer-docs/setup/install"
    exit 1
fi

# Check current identity
CURRENT_IDENTITY=$(dfx identity whoami 2>/dev/null || echo "")
if [ -z "$CURRENT_IDENTITY" ]; then
    echo "❌ Error: No dfx identity configured"
    echo ""
    echo "Please create and use an identity:"
    echo "  $ dfx identity new <name>"
    echo "  $ dfx identity use <name>"
    exit 1
fi

echo "✓ Current identity: $CURRENT_IDENTITY"

# Try to get wallet canister ID for IC network
WALLET_CHECK_FAILED=false
WALLET_ID=$(dfx identity get-wallet --network ic 2>/dev/null || echo "")

if [ -z "$WALLET_ID" ]; then
    echo "⚠️  Warning: No wallet configured for IC mainnet"
    WALLET_CHECK_FAILED=true
else
    echo "✓ Wallet canister: $WALLET_ID"
    
    # Try to check wallet balance
    BALANCE_OUTPUT=$(dfx wallet balance --network ic 2>&1 || echo "FAILED")
    
    if echo "$BALANCE_OUTPUT" | grep -q "FAILED\|error\|Error"; then
        echo "⚠️  Warning: Unable to verify wallet balance"
        WALLET_CHECK_FAILED=true
    else
        echo "✓ Wallet balance: $BALANCE_OUTPUT"
        
        # Check if balance is very low (less than 0.1 TC)
        if echo "$BALANCE_OUTPUT" | grep -qE "0\.0[0-9]+ TC|[0-9]+ million cycles"; then
            echo "⚠️  Warning: Wallet balance appears low"
            WALLET_CHECK_FAILED=true
        fi
    fi
fi

if [ "$WALLET_CHECK_FAILED" = true ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  CYCLES/WALLET READINESS CHECK FAILED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Deployment requires a configured wallet with sufficient cycles."
    echo ""
    echo "To verify your wallet configuration and cycles balance, run:"
    echo ""
    echo "  1. Check current identity:"
    echo "     $ dfx identity whoami"
    echo ""
    echo "  2. Check wallet canister ID:"
    echo "     $ dfx identity get-wallet --network ic"
    echo ""
    echo "  3. Check wallet balance:"
    echo "     $ dfx wallet balance --network ic"
    echo ""
    echo "If you need to set up a wallet or add cycles:"
    echo ""
    echo "  - Create a cycles wallet: https://internetcomputer.org/docs/current/developer-docs/setup/cycles/cycles-wallet"
    echo "  - Get free cycles: https://internetcomputer.org/docs/current/developer-docs/setup/cycles/cycles-faucet"
    echo "  - Convert ICP to cycles: https://internetcomputer.org/docs/current/developer-docs/setup/cycles/converting_icp_tokens_into_cycles"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📚 For more details, see: frontend/docs/deployment-troubleshooting.md"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    exit 1
fi

echo ""
echo "✅ Cycles/wallet readiness check passed"
echo ""

# ==================== Deployment with Retry Logic ====================

ATTEMPT=1
LAST_ERROR=""
LAST_ERROR_TYPE=""

while [ $ATTEMPT -le $MAX_RETRIES ]; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 Deployment Attempt $ATTEMPT of $MAX_RETRIES"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Run the deployment and capture output
    if dfx deploy --network ic 2>&1 | tee /tmp/deploy-output-attempt-$ATTEMPT.log; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ DEPLOYMENT SUCCESSFUL!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Your canisters are now live on the Internet Computer."
        echo "Check the output above for your frontend URL."
        echo ""
        exit 0
    else
        # Deployment failed - analyze the error
        DEPLOY_OUTPUT=$(cat /tmp/deploy-output-attempt-$ATTEMPT.log)
        
        # Check for CaLM reservation failure
        if echo "$DEPLOY_OUTPUT" | grep -q "CaLM permanent canister reservation failed"; then
            LAST_ERROR_TYPE="CaLM"
            LAST_ERROR="CaLM permanent canister reservation failed"
            
            echo ""
            echo "❌ Attempt $ATTEMPT failed: CaLM permanent canister reservation failed"
            echo ""
            
            if [ $ATTEMPT -lt $MAX_RETRIES ]; then
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo "💡 RECOMMENDED ACTION (before retry):"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo ""
                echo "Pre-create canister IDs to avoid CaLM reservation issues:"
                echo "   $ ./frontend/deploy/ic-precreate-canisters.sh"
                echo ""
                echo "This allocates canister IDs before deployment, which often resolves CaLM failures."
                echo ""
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo ""
                echo "⏳ Retrying in ${RETRY_DELAY} seconds..."
                sleep $RETRY_DELAY
            fi
        else
            # Other error
            LAST_ERROR_TYPE="OTHER"
            LAST_ERROR=$(echo "$DEPLOY_OUTPUT" | tail -20)
            
            echo ""
            echo "❌ Attempt $ATTEMPT failed with error (see output above)"
            echo ""
            
            if [ $ATTEMPT -lt $MAX_RETRIES ]; then
                echo "⏳ Retrying in ${RETRY_DELAY} seconds..."
                sleep $RETRY_DELAY
            fi
        fi
        
        ATTEMPT=$((ATTEMPT + 1))
    fi
done

# All retries exhausted
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "❌ DEPLOYMENT FAILED - ALL RETRIES EXHAUSTED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Attempted $MAX_RETRIES deployment(s), all failed."
echo ""
echo "Last failure reason: $LAST_ERROR_TYPE"
echo ""

if [ "$LAST_ERROR_TYPE" = "CaLM" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 NEXT STEPS FOR CaLM FAILURES:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Pre-create canister IDs:"
    echo "   $ ./frontend/deploy/ic-precreate-canisters.sh"
    echo ""
    echo "2. Retry deployment:"
    echo "   $ dfx deploy --network ic"
    echo ""
    echo "   OR run this script again:"
    echo "   $ ./frontend/deploy/ic-deploy-with-retry.sh"
    echo ""
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 TROUBLESHOOTING STEPS:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Review the error output above"
    echo "2. Check your network connection"
    echo "3. Verify cycles balance: dfx wallet balance --network ic"
    echo "4. Try again later (IC network may be experiencing issues)"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Detailed troubleshooting: frontend/docs/deployment-troubleshooting.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Deployment logs saved to: /tmp/deploy-output-attempt-*.log"
echo ""

exit 1

