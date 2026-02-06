#!/bin/bash

# Force link expo-image-picker native module
# This script ensures the module is properly configured and linked

set -e

echo "🔧 Force linking expo-image-picker..."

# Step 1: Verify package is installed
if [ ! -d "node_modules/expo-image-picker" ]; then
    echo "❌ expo-image-picker not found in node_modules"
    echo "   Installing..."
    npm install expo-image-picker@~16.0.5
fi
echo "✅ expo-image-picker found in node_modules"

# Step 2: Verify it's in app.json plugins
if ! grep -q "expo-image-picker" app.json; then
    echo "❌ expo-image-picker not found in app.json plugins"
    echo "   Please add it to the plugins array"
    exit 1
fi
echo "✅ expo-image-picker found in app.json"

# Step 3: Clean everything
echo "🧹 Cleaning build artifacts..."
cd ios
rm -rf Pods Podfile.lock build DerivedData
cd ..
rm -rf .expo node_modules/.cache

# Step 4: Prebuild to regenerate native code
echo "🔨 Running Expo prebuild..."
npx expo prebuild --platform ios --clean

# Step 5: Install pods
echo "📦 Installing pods..."
cd ios
export LANG=en_US.UTF-8
pod install
cd ..

# Step 6: Verify ExpoImagePicker
if [ -d "ios/Pods/Target Support Files/ExpoImagePicker" ]; then
    echo "✅ ExpoImagePicker target support files found"
else
    echo "⚠️  ExpoImagePicker target support files not found"
    echo "   But this might be okay if using local pods"
fi

if grep -q "ExpoImagePicker" ios/Podfile.lock; then
    echo "✅ ExpoImagePicker found in Podfile.lock"
else
    echo "❌ ExpoImagePicker NOT in Podfile.lock"
    echo "   Something went wrong with pod install"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next: Rebuild the app"
echo "  npx expo run:ios --device"
echo ""
