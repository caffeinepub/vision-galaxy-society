#!/bin/bash
# Pre-create Canisters on IC Mainnet
# This script explicitly creates canister IDs before deployment to avoid CaLM reservation issues

set -e

echo "🔧 Pre-creating canisters on IC mainnet..."
echo ""

# Check if dfx.json exists
if [ ! -f "dfx.json" ]; then
    echo "❌ Error: dfx.json not found. Please run this script from the project root."
    exit 1
fi

# Create backend canister if it doesn't exist
echo "📦 Creating backend canister..."
if dfx canister create backend --network ic 2>&1 | grep -q "already exists"; then
    echo "   ℹ️  Backend canister already exists"
else
    echo "   ✅ Backend canister created"
fi

# Create frontend canister if it doesn't exist
echo "📦 Creating frontend canister..."
if dfx canister create frontend --network ic 2>&1 | grep -q "already exists"; then
    echo "   ℹ️  Frontend canister already exists"
else
    echo "   ✅ Frontend canister created"
fi

echo ""
echo "✅ Canister pre-creation complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT STEP:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Now retry the deployment:"
echo "   $ dfx deploy --network ic"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
