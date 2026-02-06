#!/bin/bash

# Fix: Cannot find native module 'ExponentImagePicker'
# This script ensures expo-image-picker is properly installed and linked

set -e

echo "🔧 Fixing expo-image-picker native module..."

# Step 1: Clean iOS build
echo "📦 Step 1: Cleaning iOS build..."
cd ios
rm -rf Pods Podfile.lock build
echo "✅ Cleaned iOS build"

# Step 2: Reinstall pods
echo "📦 Step 2: Reinstalling pods..."
export LANG=en_US.UTF-8
pod install
echo "✅ Pods reinstalled"

# Step 3: Verify ExpoImagePicker is installed
if [ -d "Pods/ExpoImagePicker" ]; then
    echo "✅ ExpoImagePicker pod found"
else
    echo "❌ ExpoImagePicker pod not found - checking Podfile.lock..."
    if grep -q "ExpoImagePicker" Podfile.lock; then
        echo "⚠️  ExpoImagePicker is in Podfile.lock but pod directory missing"
        echo "   This might be a pod install issue. Try running 'pod install' again."
    else
        echo "❌ ExpoImagePicker not found in Podfile.lock"
        echo "   Make sure expo-image-picker is in package.json and app.json plugins"
    fi
fi

cd ..

# Step 4: Clear Metro cache
echo "🧹 Step 3: Clearing Metro cache..."
npx expo start --clear &
METRO_PID=$!
sleep 2
kill $METRO_PID 2>/dev/null || true
echo "✅ Metro cache cleared"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Rebuild the app: npx expo run:ios --device"
echo "2. Make sure your device is connected and trusted"
echo "3. The build will take 5-10 minutes for the first time"
echo ""
