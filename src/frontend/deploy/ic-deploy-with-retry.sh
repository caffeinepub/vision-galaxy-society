#!/bin/bash
# IC Mainnet Deployment Helper with Retry Mode and Cycles Check
# This script wraps dfx deploy --network ic with configurable retry logic and pre-deployment checks

set -e

# Verify we're running from project root
if [ ! -f "dfx.json" ]; then
    echo "❌ Error: dfx.json not found"
    echo ""
    echo "This script must be run from the project root directory."
    echo ""
    echo "Example:"
    echo "  $ cd /path/to/your/project"
    echo "  $ ./frontend/deploy/ic-deploy-with-retry.sh"
    echo ""
    exit 1
fi

# Configuration (can be overridden via environment variables)
MAX_RETRIES="${MAX_RETRIES:-3}"
RETRY_DELAY="${RETRY_DELAY:-30}"
AUTO_PRECREATE="${AUTO_PRECREATE:-false}"

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
        --auto-precreate)
            AUTO_PRECREATE="true"
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --max-retries N      Maximum number of deployment attempts (default: 3)"
            echo "  --retry-delay N      Seconds to wait between retries (default: 30)"
            echo "  --auto-precreate     Automatically run canister pre-creation on reservation failures"
            echo "  --help               Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  MAX_RETRIES          Same as --max-retries"
            echo "  RETRY_DELAY          Same as --retry-delay"
            echo "  AUTO_PRECREATE       Same as --auto-precreate (set to 'true')"
            echo "  VITE_CANONICAL_APP_URL  Custom domain URL (loaded from .env if present)"
            echo ""
            echo "Example:"
            echo "  $0 --max-retries 5 --retry-delay 60 --auto-precreate"
            echo ""
            echo "For more information, see: frontend/deploy/README.md"
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
echo "  Auto pre-create: $AUTO_PRECREATE"
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
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📚 For more details, see: frontend/docs/deployment-troubleshooting.md"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    exit 1
fi

# Check current identity
CURRENT_IDENTITY=$(dfx identity whoami 2>/dev/null || echo "")
if [ -z "$CURRENT_IDENTITY" ]; then
    echo "❌ Error: No dfx identity configured"
    echo ""
    echo "Please create and use an identity:"
    echo "  $ dfx identity new my-identity"
    echo "  $ dfx identity use my-identity"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📚 For more details, see: frontend/docs/deployment-troubleshooting.md"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
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

# ==================== Load Canonical URL from Environment ====================

# Try to load VITE_CANONICAL_APP_URL from .env file if it exists and not already set
if [ -z "$VITE_CANONICAL_APP_URL" ] && [ -f "frontend/.env" ]; then
    # Source the .env file safely (only VITE_CANONICAL_APP_URL)
    VITE_CANONICAL_APP_URL=$(grep "^VITE_CANONICAL_APP_URL=" frontend/.env 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")
fi

# ==================== Deployment with Retry Logic ====================

ATTEMPT=1
LAST_ERROR=""
LAST_ERROR_TYPE=""
LOG_DIR="frontend/deploy/logs"
mkdir -p "$LOG_DIR"

PRECREATE_RAN=false

while [ $ATTEMPT -le $MAX_RETRIES ]; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 Deployment Attempt $ATTEMPT of $MAX_RETRIES"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Run the deployment and capture output
    LOG_FILE="${LOG_DIR}/deploy-output-attempt-${ATTEMPT}.log"
    if dfx deploy --network ic 2>&1 | tee "$LOG_FILE"; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ DEPLOYMENT SUCCESSFUL!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        # Try to extract frontend canister ID
        FRONTEND_CANISTER_ID=$(dfx canister id frontend --network ic 2>/dev/null || echo "")
        
        if [ -n "$FRONTEND_CANISTER_ID" ]; then
            echo "📱 Your application is now live and publicly accessible!"
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "🆔 Frontend Canister ID:"
            echo ""
            echo "   $FRONTEND_CANISTER_ID"
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            
            # Determine and display the live URL
            if [ -n "$VITE_CANONICAL_APP_URL" ]; then
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo "🌐 Live Frontend URL (Canonical):"
                echo ""
                echo "   $VITE_CANONICAL_APP_URL"
                echo ""
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo ""
                echo "   (Using canonical URL from VITE_CANONICAL_APP_URL)"
                echo ""
                echo "   Default IC URL: https://${FRONTEND_CANISTER_ID}.ic0.app"
            else
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo "🌐 Live Frontend URL:"
                echo ""
                echo "   https://${FRONTEND_CANISTER_ID}.ic0.app"
                echo ""
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo ""
                echo "💡 Tip: Set VITE_CANONICAL_APP_URL to use a custom domain"
                echo "   See: frontend/.env.example and frontend/deploy/README.md"
            fi
            echo ""
        else
            echo "Your canisters are now live on the Internet Computer."
            echo "Check the output above for your frontend URL."
            echo ""
        fi
        
        echo "📋 Deployment logs saved to: $LOG_FILE"
        echo ""
        exit 0
    else
        # Deployment failed - analyze the error
        DEPLOY_OUTPUT=$(cat "$LOG_FILE")
        
        # Check for canister reservation/creation failures (including CaLM)
        if echo "$DEPLOY_OUTPUT" | grep -qE "CaLM permanent canister reservation failed|canister.*reservation.*failed|canister.*creation.*failed|Application creation unsuccessful"; then
            LAST_ERROR_TYPE="CANISTER_RESERVATION"
            
            # Extract specific error message
            if echo "$DEPLOY_OUTPUT" | grep -q "CaLM permanent canister reservation failed"; then
                LAST_ERROR="CaLM permanent canister reservation failed"
            elif echo "$DEPLOY_OUTPUT" | grep -q "Application creation unsuccessful"; then
                LAST_ERROR="Application creation unsuccessful"
            else
                LAST_ERROR="Canister reservation/creation failed"
            fi
            
            echo ""
            echo "❌ Attempt $ATTEMPT failed: $LAST_ERROR"
            echo ""
            
            if [ $ATTEMPT -lt $MAX_RETRIES ]; then
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo "💡 RECOMMENDED ACTION (before retry):"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo ""
                
                if [ "$AUTO_PRECREATE" = "true" ] && [ "$PRECREATE_RAN" = "false" ]; then
                    echo "Running canister pre-creation automatically..."
                    echo ""
                    if ./frontend/deploy/ic-precreate-canisters.sh; then
                        PRECREATE_RAN=true
                        echo ""
                        echo "✅ Canister pre-creation completed"
                        echo ""
                    else
                        echo ""
                        echo "⚠️  Canister pre-creation failed, but will retry deployment anyway"
                        echo ""
                    fi
                else
                    echo "Pre-create canister IDs to avoid reservation issues:"
                    echo "   $ ./frontend/deploy/ic-precreate-canisters.sh"
                    echo ""
                    echo "This allocates canister IDs before deployment, which often resolves"
                    echo "canister reservation and creation failures."
                    echo ""
                    echo "Alternatively, run this script with --auto-precreate flag to automatically"
                    echo "run the pre-creation step when reservation failures are detected."
                    echo ""
                fi
                
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo ""
                echo "⏳ Retrying in ${RETRY_DELAY} seconds..."
                sleep $RETRY_DELAY
            fi
        else
            # Other/generic error
            LAST_ERROR_TYPE="GENERIC"
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
echo "Last failure type: $LAST_ERROR_TYPE"
echo ""

if [ "$LAST_ERROR_TYPE" = "CANISTER_RESERVATION" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 NEXT STEPS FOR CANISTER RESERVATION/CREATION FAILURES:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Pre-create canister IDs:"
    echo "   $ ./frontend/deploy/ic-precreate-canisters.sh"
    echo ""
    echo "2. Retry deployment with this script:"
    echo "   $ ./frontend/deploy/ic-deploy-with-retry.sh"
    echo ""
    echo "   OR deploy directly:"
    echo "   $ dfx deploy --network ic"
    echo ""
    echo "📋 Full deployment logs saved to:"
    echo "   ${LOG_DIR}/deploy-output-attempt-*.log"
    echo ""
elif [ "$LAST_ERROR_TYPE" = "GENERIC" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 GENERIC FAILURE DIAGNOSTICS:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 Full deployment logs saved to:"
    echo "   ${LOG_DIR}/deploy-output-attempt-*.log"
    echo ""
    echo "Last error lines from attempt $((ATTEMPT - 1)):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tail -15 "${LOG_DIR}/deploy-output-attempt-$((ATTEMPT - 1)).log" 2>/dev/null || echo "(Log file not available)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🔍 TROUBLESHOOTING STEPS:"
    echo ""
    echo "1. Review the full error output in the log files above"
    echo "2. Check your network connection"
    echo "3. Verify cycles balance:"
    echo "   $ dfx wallet balance --network ic"
    echo "4. Verify dfx version (requires 0.15.0+):"
    echo "   $ dfx --version"
    echo "5. Check IC network status: https://status.internetcomputer.org/"
    echo "6. Try pre-creating canisters:"
    echo "   $ ./frontend/deploy/ic-precreate-canisters.sh"
    echo "7. Try again later (IC network may be experiencing issues)"
    echo ""
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 TROUBLESHOOTING STEPS:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Review the error output above"
    echo "2. Check your network connection"
    echo "3. Verify cycles balance:"
    echo "   $ dfx wallet balance --network ic"
    echo "4. Check IC network status: https://status.internetcomputer.org/"
    echo "5. Try again later (IC network may be experiencing issues)"
    echo ""
    echo "📋 Full deployment logs saved to:"
    echo "   ${LOG_DIR}/deploy-output-attempt-*.log"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Detailed troubleshooting: frontend/docs/deployment-troubleshooting.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit 1
