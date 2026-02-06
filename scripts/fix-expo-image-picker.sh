#!/bin/bash

# Fix: Install and link expo-image-picker native module
# This script ensures the module is properly installed and linked

set -e

echo "🔧 Fixing expo-image-picker installation..."

# Step 1: Verify package is in package.json
if ! grep -q "expo-image-picker" package.json; then
    echo "❌ expo-image-picker not found in package.json"
    echo "   Please add it first: npm install expo-image-picker@~16.0.5"
    exit 1
fi
echo "✅ expo-image-picker found in package.json"

# Step 2: Reinstall node modules (to ensure package is installed)
echo "📦 Step 1: Reinstalling node modules..."
npm install
echo "✅ Node modules reinstalled"

# Step 3: Verify package is in node_modules
if [ ! -d "node_modules/expo-image-picker" ]; then
    echo "❌ expo-image-picker not found in node_modules after install"
    echo "   Try: npm install expo-image-picker@~16.0.5"
    exit 1
fi
echo "✅ expo-image-picker found in node_modules"

# Step 4: Clean iOS build
echo "🧹 Step 2: Cleaning iOS build..."
cd ios
rm -rf Pods Podfile.lock build
echo "✅ iOS build cleaned"

# Step 5: Reinstall pods
echo "📦 Step 3: Reinstalling pods..."
export LANG=en_US.UTF-8
pod install
echo "✅ Pods reinstalled"

# Step 6: Verify ExpoImagePicker is installed
if [ -d "Pods/ExpoImagePicker" ]; then
    echo "✅ ExpoImagePicker pod installed successfully"
else
    echo "⚠️  ExpoImagePicker pod not found after install"
    echo "   Checking Podfile.lock..."
    if grep -q "ExpoImagePicker" Podfile.lock; then
        echo "   ExpoImagePicker is in Podfile.lock but directory missing"
        echo "   Try running 'pod install' again manually"
    else
        echo "   ExpoImagePicker not in Podfile.lock"
        echo "   Check that expo-image-picker is in app.json plugins"
    fi
fi

cd ..

# Step 7: Clear Metro cache
echo "🧹 Step 4: Clearing Metro cache..."
rm -rf .expo node_modules/.cache 2>/dev/null || true
echo "✅ Metro cache cleared"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Rebuild the app: npx expo run:ios --device"
echo "2. Make sure your device is connected and trusted"
echo "3. The build will take 5-10 minutes"
echo ""
echo "To verify ExpoImagePicker is installed:"
echo "  ls ios/Pods/ExpoImagePicker"
echo ""
