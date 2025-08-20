# 🚀 DigiRakshak APK Build - Quick Guide

## ❌ **आपकी Current Problem:**
आप `C:\Users\rauna\` में हैं, लेकिन project folder में होना चाहिए।

## ✅ **Solution - Step by Step:**

### **Step 1: Project Download करें**
1. इस page के top-right में **"Download"** button click करें
2. ZIP file download होगी
3. ZIP को extract करें (जैसे: `C:\Users\rauna\DigiRakshak\`)

### **Step 2: Project Folder में जाएं**
```bash
# Terminal में project folder में जाएं:
cd C:\Users\rauna\DigiRakshak
# या जहाँ भी आपने extract किया हो

# Check करें कि package.json है:
dir package.json
```

### **Step 3: Dependencies Install करें**
```bash
# Project folder में होने के बाद:
npm install
```

### **Step 4: EAS CLI Install करें**
```bash
npm install -g eas-cli
```

### **Step 5: Expo Login करें**
```bash
eas login
# Free account बनाएं: https://expo.dev/signup
```

### **Step 6: APK Build करें**
```bash
npm run build
```

## 📁 **Correct Directory Structure:**
```
C:\Users\rauna\DigiRakshak\
├── package.json          ← ये file होनी चाहिए
├── app.json
├── eas.json
├── app/
├── services/
└── ...
```

## 🔧 **Commands Summary:**
```bash
# 1. Project folder में जाएं
cd path\to\your\project

# 2. Dependencies install करें
npm install

# 3. EAS CLI install करें
npm install -g eas-cli

# 4. Login करें
eas login

# 5. Build करें
npm run build
```

## ⚠️ **Important Notes:**
- Project folder में `package.json` file होनी चाहिए
- Internet connection चाहिए
- Expo account (free) बनाना होगा
- Build में 10-15 minutes लगेंगे

## 📱 **After Build:**
- Terminal में download link मिलेगा
- APK download करके phone में install करें
- सभी features test करें

---
**Happy Building! 🚀**