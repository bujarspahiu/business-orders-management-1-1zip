#!/bin/bash

echo "========================================="
echo "  Lassa Tyres - Mobile App Build Setup"
echo "========================================="
echo ""

if [ -z "$1" ]; then
  echo "Usage: ./scripts/prepare-mobile.sh YOUR_PUBLISHED_URL"
  echo ""
  echo "Example:"
  echo "  ./scripts/prepare-mobile.sh https://your-app-name.replit.app"
  echo ""
  echo "You can find your published URL in Replit's Publishing section."
  exit 1
fi

SERVER_URL=$1

SERVER_URL="${SERVER_URL%/}"

if [[ ! "$SERVER_URL" =~ ^https:// ]]; then
  echo "ERROR: The URL must start with https://"
  echo "Example: https://your-app-name.replit.app"
  exit 1
fi

if [[ "$SERVER_URL" =~ [[:space:]] ]]; then
  echo "ERROR: The URL contains spaces. Please check and try again."
  exit 1
fi

echo "Server URL: $SERVER_URL"
echo ""

echo "Step 1: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
  echo "ERROR: npm install failed. Please check your internet connection and try again."
  exit 1
fi

echo ""
echo "Step 2: Building web app..."
npm run build
if [ $? -ne 0 ]; then
  echo "ERROR: Build failed. Please check for errors above."
  exit 1
fi

echo ""
echo "Step 3: Setting server URL..."
if [ ! -f dist/index.html ]; then
  echo "ERROR: dist/index.html not found. Build may have failed."
  exit 1
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s|window.__LASSA_API_URL__ = ''|window.__LASSA_API_URL__ = '$SERVER_URL'|g" dist/index.html
else
  sed -i "s|window.__LASSA_API_URL__ = ''|window.__LASSA_API_URL__ = '$SERVER_URL'|g" dist/index.html
fi

if grep -q "$SERVER_URL" dist/index.html; then
  echo "Server URL set successfully."
else
  echo "WARNING: Could not verify URL was set in dist/index.html."
  echo "You may need to manually edit dist/index.html and set:"
  echo "  window.__LASSA_API_URL__ = '$SERVER_URL'"
fi

echo ""
echo "Step 4: Syncing native projects..."
npx cap sync
if [ $? -ne 0 ]; then
  echo "ERROR: Capacitor sync failed. Please check for errors above."
  exit 1
fi

echo ""
echo "========================================="
echo "  Build preparation complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  Android: Open the 'android' folder in Android Studio"
echo "  iOS:     Open 'ios/App/App.xcworkspace' in Xcode"
echo ""
echo "See MOBILE_BUILD_INSTRUCTIONS.md for detailed instructions."
echo ""
