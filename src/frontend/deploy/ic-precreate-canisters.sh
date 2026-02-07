#!/bin/bash
# Pre-create Canisters on IC Mainnet
# This script explicitly creates canister IDs before deployment to avoid CaLM reservation issues

set -e

# Check if dfx.json exists (verify we're in project root)
if [ ! -f "dfx.json" ]; then
    echo "❌ Error: dfx.json not found"
    echo ""
    echo "This script must be run from the project root directory."
    echo ""
    echo "Example:"
    echo "  $ cd /path/to/your/project"
    echo "  $ ./frontend/deploy/ic-precreate-canisters.sh"
    echo ""
    exit 1
fi

echo "🔧 Pre-creating canisters on IC mainnet..."
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

# Create backend canister if it doesn't exist
echo "📦 Creating backend canister..."
BACKEND_OUTPUT=$(dfx canister create backend --network ic 2>&1 || true)

if echo "$BACKEND_OUTPUT" | grep -q "already exists"; then
    echo "   ℹ️  Backend canister already exists"
elif echo "$BACKEND_OUTPUT" | grep -qE "Creating canister|Canister created"; then
    echo "   ✅ Backend canister created"
else
    # Check if it's a real error or just already exists
    if dfx canister id backend --network ic &> /dev/null; then
        echo "   ℹ️  Backend canister already exists"
    else
        echo "   ❌ Failed to create backend canister"
        echo ""
        echo "Error output:"
        echo "$BACKEND_OUTPUT"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📚 For troubleshooting, see: frontend/docs/deployment-troubleshooting.md"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        exit 1
    fi
fi

# Create frontend canister if it doesn't exist
echo "📦 Creating frontend canister..."
FRONTEND_OUTPUT=$(dfx canister create frontend --network ic 2>&1 || true)

if echo "$FRONTEND_OUTPUT" | grep -q "already exists"; then
    echo "   ℹ️  Frontend canister already exists"
elif echo "$FRONTEND_OUTPUT" | grep -qE "Creating canister|Canister created"; then
    echo "   ✅ Frontend canister created"
else
    # Check if it's a real error or just already exists
    if dfx canister id frontend --network ic &> /dev/null; then
        echo "   ℹ️  Frontend canister already exists"
    else
        echo "   ❌ Failed to create frontend canister"
        echo ""
        echo "Error output:"
        echo "$FRONTEND_OUTPUT"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📚 For troubleshooting, see: frontend/docs/deployment-troubleshooting.md"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        exit 1
    fi
fi

echo ""
echo "✅ Canister pre-creation complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT STEP:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Now retry the deployment:"
echo "   $ ./frontend/deploy/ic-deploy-with-retry.sh"
echo ""
echo "OR deploy directly:"
echo "   $ dfx deploy --network ic"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
