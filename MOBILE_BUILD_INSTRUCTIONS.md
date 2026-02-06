# Mobile App Build Instructions

This guide explains how to build the Lassa Tyres Android and iOS apps and publish them to Google Play and Apple App Store.

---

## What You Need

### For Android:
- A Windows, Mac, or Linux computer
- [Android Studio](https://developer.android.com/studio) (free download)
- Java Development Kit (JDK) 17 or higher
- Google Play Developer Account ($25 one-time fee) - only if publishing to the store

### For iOS:
- A Mac computer (required - Apple only allows iOS builds on Mac)
- [Xcode](https://developer.apple.com/xcode/) (free from the Mac App Store)
- Apple Developer Account ($99/year) - only if publishing to the store

---

## Step 1: Download the Project

1. In Replit, click the three dots menu (three dots) in the Files panel
2. Select **"Download as zip"**
3. Extract the zip file on your computer
4. Open a terminal/command prompt and navigate to the extracted folder

---

## Step 2: Find Your Published App URL

Before building the mobile apps, you need your published website URL:

1. In Replit, open the **Publishing** tool
2. Copy your published URL (it looks like `https://your-app-name.replit.app`)
3. You will need this URL in the next step

---

## Step 3: Prepare the Mobile Build

Open a terminal in your extracted project folder and run:

```bash
# Install dependencies
npm install

# Build the web app
npm run build

# IMPORTANT: Set your published server URL so the mobile app can connect to it
# Replace YOUR_URL_HERE with your actual published URL from Step 2

# On Mac/Linux:
sed -i '' "s|window.__LASSA_API_URL__ = ''|window.__LASSA_API_URL__ = 'YOUR_URL_HERE'|g" dist/index.html

# On Windows (PowerShell):
(Get-Content dist/index.html) -replace "window.__LASSA_API_URL__ = ''", "window.__LASSA_API_URL__ = 'YOUR_URL_HERE'" | Set-Content dist/index.html

# Sync the web build to native projects
npx cap sync
```

**Or use the helper script (Mac/Linux only):**
```bash
./scripts/prepare-mobile.sh https://your-published-url.replit.app
```

---

## Step 4: Build for Android

### Open in Android Studio:
1. Open Android Studio
2. Click **"Open"** and navigate to the `android` folder inside your project
3. Wait for Gradle sync to complete (this may take a few minutes the first time)

### Test on Your Phone:
1. Connect your Android phone via USB cable
2. Enable "Developer options" and "USB debugging" on your phone
3. Select your phone from the device dropdown in Android Studio
4. Click the green **Play** button to run the app

### Test on Emulator:
1. In Android Studio, go to **Tools > Device Manager**
2. Click **"Create Device"** and choose a phone model
3. Download a system image and create the emulator
4. Select the emulator and click the green **Play** button

### Build for Google Play Store:
1. In Android Studio, update the version in `android/app/build.gradle`:
   ```gradle
   android {
       defaultConfig {
           versionCode 1        // Increment this number for each new release
           versionName "1.0.0"  // Display version shown to users
       }
   }
   ```
2. Go to **Build > Generate Signed Bundle / APK**
3. Select **Android App Bundle (AAB)**
4. Create a new keystore (save this file safely - you need it for every update!)
5. Select **release** build type
6. Click **Finish** - your AAB file will be in `android/app/release/`

### Upload to Google Play:
1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Go to **Production > Create new release**
4. Upload your `.aab` file
5. Fill in the store listing (description, screenshots, etc.)
6. Submit for review

---

## Step 5: Build for iOS

### Install CocoaPods:
```bash
sudo gem install cocoapods
cd ios/App
pod install
cd ../..
```

### Open in Xcode:
1. Open **`ios/App/App.xcworkspace`** in Xcode (NOT the .xcodeproj file)
2. Wait for indexing to complete

### Test on Simulator:
1. Select an iPhone model from the top device bar
2. Click the **Play** button to run in the simulator

### Test on Your iPhone:
1. Connect your iPhone via USB
2. Select your phone from the device dropdown
3. You may need to trust the developer certificate on your phone (Settings > General > Device Management)
4. Click **Play** to run on your phone

### Build for App Store:
1. Select the **App** target in the left panel
2. Go to **General** tab and set:
   - **Version**: 1.0.0 (display version)
   - **Build**: 1 (increment for each upload)
3. Go to **Signing & Capabilities** tab
4. Select your Apple Developer team
5. Select **Any iOS Device** as the build target
6. Go to **Product > Archive**
7. When the archive completes, click **Distribute App**
8. Select **App Store Connect** and follow the prompts

### Submit to App Store:
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app
3. Fill in app information, screenshots, and description
4. Select the build you uploaded
5. Submit for review

---

## App Details

- **App ID**: `com.lassatyres.app`
- **App Name**: Lassa Tyres
- **Server**: Your published Replit URL

### To Change the App ID:
If Google Play or Apple requires a different ID:
1. Update `appId` in `capacitor.config.ts`
2. Run `npx cap sync` again

---

## Adding Your App Icon

### Android:
Replace the icon files in `android/app/src/main/res/`:
- `mipmap-mdpi/ic_launcher.png` (48x48 pixels)
- `mipmap-hdpi/ic_launcher.png` (72x72 pixels)
- `mipmap-xhdpi/ic_launcher.png` (96x96 pixels)
- `mipmap-xxhdpi/ic_launcher.png` (144x144 pixels)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192 pixels)

### iOS:
Replace files in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
Use these sizes: 20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024 pixels

**Tip:** Use a tool like [appicon.co](https://appicon.co) to automatically generate all icon sizes from one image.

---

## Updating the App After Changes

When you make changes to your website in Replit:

1. Publish the updated website in Replit
2. Download the updated project
3. Run the prepare script again:
   ```bash
   ./scripts/prepare-mobile.sh https://your-published-url.replit.app
   ```
4. Open in Android Studio / Xcode
5. Increment the version number
6. Build and upload the new version

---

## Troubleshooting

### App Shows Blank Screen:
- Make sure you set the published URL in Step 3
- Check that your published website is running
- Run `npx cap sync` again

### Android Build Fails:
- Make sure Gradle sync completed (look for green checkmark)
- Check that JDK 17+ is installed
- Try **File > Invalidate Caches and Restart** in Android Studio

### iOS Build Fails:
- Make sure you ran `pod install` in the `ios/App` folder
- Open `.xcworkspace` file, NOT `.xcodeproj`
- Check that you selected a valid signing team

### API Calls Not Working:
- Verify your published URL is correct and the website is live
- Check that you replaced `YOUR_URL_HERE` with the actual URL
- Make sure the URL starts with `https://`

---

## Helpful Links

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Publishing Guide](https://developer.android.com/studio/publish)
- [iOS Publishing Guide](https://developer.apple.com/ios/submit/)
- [App Icon Generator](https://appicon.co)
