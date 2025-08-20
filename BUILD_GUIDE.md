# 📱 DigiRakshak APK Build Guide

## 🚀 Method 1: EAS Build (Easiest - Recommended)

### Step 1: Prerequisites
```bash
# Node.js install करें (अगर नहीं है)
# Download from: https://nodejs.org/

# Check Node.js version
node --version
npm --version
```

### Step 2: Install EAS CLI
```bash
# Terminal/Command Prompt में run करें
npm install -g @expo/eas-cli

# Verify installation
eas --version
```

### Step 3: Create Expo Account
```bash
# Expo account बनाएं (free)
eas login

# या browser में जाकर account बनाएं: https://expo.dev/signup
```

### Step 4: Project Setup
```bash
# Project folder में जाएं
cd your-project-folder

# Dependencies install करें
npm install

# EAS configure करें
eas build:configure
```

### Step 5: Build APK
```bash
# APK build करें
eas build --platform android --profile preview

# Build status check करें
eas build:list
```

### Step 6: Download APK
- Build complete होने पर terminal में download link मिलेगा
- या Expo dashboard पर जाकर download करें: https://expo.dev/accounts/[username]/projects/[project]/builds

---

## 🔧 Method 2: Local Build (Advanced)

### Step 1: Install Android Studio
1. Download Android Studio: https://developer.android.com/studio
2. Install करें और SDK setup करें
3. Environment variables set करें

### Step 2: Setup Environment
```bash
# Android SDK path set करें
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Step 3: Build APK
```bash
# Project में जाएं
cd your-project-folder

# Dependencies install करें
npm install

# Android build करें
npx expo run:android --variant release

# या direct APK build करें
./gradlew assembleRelease
```

---

## 📱 Method 3: Expo Development Build

### Step 1: Create Development Build
```bash
# Development build profile बनाएं
eas build --profile development --platform android
```

### Step 2: Install on Device
```bash
# APK install करें device पर
adb install app-release.apk
```

---

## 🛠️ Troubleshooting

### Common Issues:

1. **Node.js not found**
   ```bash
   # Node.js download करें: https://nodejs.org/
   ```

2. **EAS CLI permission error**
   ```bash
   # Admin/sudo के साथ install करें
   sudo npm install -g @expo/eas-cli
   ```

3. **Build failed**
   ```bash
   # Dependencies clear करें
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

4. **Android SDK not found**
   ```bash
   # Android Studio install करें
   # SDK path properly set करें
   ```

---

## 📋 Build Configuration Files

### eas.json (Already configured)
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

### app.json (Already configured)
- Package name: com.digirakshak.cyberpolice
- Version: 1.0.0
- All permissions configured

---

## ✅ Success Indicators

Build successful होने पर आपको मिलेगा:
- ✅ Build completion message
- ✅ APK download link
- ✅ QR code for direct download
- ✅ File size information

---

## 📞 Support

अगर कोई problem आए तो:
1. Error message screenshot लें
2. Terminal output copy करें
3. Build logs check करें

Happy Building! 🚀