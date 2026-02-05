# Mobile App Build Instructions

This guide explains how to build the Android and iOS apps for publishing to Google Play Console and Apple App Store.

## Prerequisites

### For Android:
- [Android Studio](https://developer.android.com/studio) installed on your computer
- Java Development Kit (JDK) 17 or higher
- Google Play Developer Account ($25 one-time fee)

### For iOS:
- Mac computer with [Xcode](https://developer.apple.com/xcode/) installed
- Apple Developer Account ($99/year)
- CocoaPods installed (`sudo gem install cocoapods`)

---

## Step 1: Download the Project

1. In Replit, click the three dots menu (⋮) in the Files panel
2. Select "Download as zip"
3. Extract the zip file on your computer

---

## Step 2: Build for Android (Google Play Console)

### Open in Android Studio:
1. Open Android Studio
2. Select "Open" and navigate to the `android` folder inside your extracted project
3. Wait for Gradle sync to complete (may take a few minutes)

### Generate Signed APK/AAB:
1. Go to **Build > Generate Signed Bundle / APK**
2. Select **Android App Bundle (AAB)** for Google Play (recommended)
3. Create a new keystore or use existing:
   - Click "Create new..."
   - Choose a location and filename (keep this file safe!)
   - Set passwords and fill in certificate info
4. Select **release** build variant
5. Click **Finish**

### Upload to Google Play Console:
1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Go to **Production > Create new release**
4. Upload your `.aab` file
5. Complete all required sections (store listing, content rating, etc.)
6. Submit for review

---

## Step 3: Build for iOS (Apple App Store)

### Install Dependencies:
```bash
cd ios/App
pod install
```

### Open in Xcode:
1. Open `ios/App/App.xcworkspace` in Xcode (NOT the .xcodeproj file)
2. Wait for indexing to complete

### Configure Signing:
1. Select the **App** project in the navigator
2. Go to **Signing & Capabilities** tab
3. Select your Team (Apple Developer account)
4. Xcode will automatically manage signing

### Build Archive:
1. Select **Any iOS Device** as the build target
2. Go to **Product > Archive**
3. Wait for the build to complete

### Upload to App Store Connect:
1. In the Organizer window, select your archive
2. Click **Distribute App**
3. Select **App Store Connect**
4. Follow the prompts to upload
5. Go to [App Store Connect](https://appstoreconnect.apple.com)
6. Complete app information and submit for review

---

## App Configuration

### App Details (in capacitor.config.ts):
- **App ID**: `com.lassatyres.app`
- **App Name**: Lassa Tyres

### To Change App ID:
If you need a different app ID for the stores, update:
1. `capacitor.config.ts` - change `appId`
2. Run `npx cap sync` to apply changes

---

## Adding App Icons and Splash Screens

### Android Icons:
Replace files in `android/app/src/main/res/`:
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

### iOS Icons:
Replace files in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
Use sizes: 20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024 pixels

---

## Updating the App

When you make changes to your web app:
1. Run `npm run build` in Replit
2. Download the updated project
3. Run `npx cap sync` on your computer
4. Rebuild in Android Studio / Xcode

---

## Troubleshooting

### Android Build Fails:
- Ensure Gradle sync completed successfully
- Check that JDK 17+ is installed
- Try **File > Invalidate Caches and Restart**

### iOS Build Fails:
- Run `pod install` again in `ios/App` folder
- Ensure you're opening `.xcworkspace` not `.xcodeproj`
- Check signing configuration

### App Not Loading Content:
- Make sure `npm run build` completed successfully before syncing
- Run `npx cap sync` to update native projects

---

## Need Help?

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Publishing Guide](https://developer.android.com/studio/publish)
- [iOS Publishing Guide](https://developer.apple.com/ios/submit/)
