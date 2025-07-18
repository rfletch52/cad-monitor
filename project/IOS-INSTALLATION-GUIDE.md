# 📱 iOS Installation Guide - Get Your Emergency App on iPhone

## 🚀 **Step 1: Wait for GitHub Build (10-15 minutes)**

1. **Go to your GitHub repository**: https://github.com/rfletch52/cad-monitor
2. **Click the "Actions" tab**
3. **Look for a running build** (yellow circle = building, green checkmark = done)
4. **Wait for the iOS build to complete**

## 📥 **Step 2: Download the iOS App**

Once the build is complete:
1. **Click on the completed workflow run**
2. **Scroll down to "Artifacts"**
3. **Download `ios-app`** - this contains your .ipa file
4. **Unzip the downloaded file** - you'll get a `.ipa` file

## 📱 **Step 3: Install on iPhone (Multiple Options)**

### **Option A: TestFlight (Recommended - Easiest)**

**Requirements:**
- Apple Developer Account ($99/year)
- TestFlight app on your iPhone

**Steps:**
1. **Sign up for Apple Developer**: https://developer.apple.com/programs/
2. **Upload .ipa to App Store Connect**
3. **Add yourself as a beta tester**
4. **Install via TestFlight app**

### **Option B: Direct Install (Advanced)**

**Requirements:**
- Mac computer with Xcode
- iPhone connected via USB

**Steps:**
1. **Open Xcode on Mac**
2. **Go to Window → Devices and Simulators**
3. **Select your iPhone**
4. **Drag the .ipa file to the "Installed Apps" section**

### **Option C: Third-Party Tools**

**Tools like AltStore or Sideloadly:**
1. **Install AltStore** on your computer
2. **Connect iPhone via USB**
3. **Use AltStore to install the .ipa file**

## 🚨 **Emergency Features You'll Get:**

✅ **Audio that bypasses silent mode** - Emergency alerts play even when phone is muted
✅ **Strong vibration patterns** - Hardware-level vibration for critical incidents
✅ **Background monitoring** - Continues working when app is minimized
✅ **System notifications** - Real push notifications on lock screen
✅ **Keep screen awake** - Prevents phone from sleeping during monitoring

## 🧪 **Test the Emergency Audio:**

Once installed:
1. **Put your iPhone in silent mode**
2. **Open the Winnipeg CAD Monitor app**
3. **Tap the red "TEST EMERGENCY ALERT" button**
4. **Audio should play loudly even in silent mode!** 🔊

## ⚠️ **Important Notes:**

- **iOS is restrictive** - Direct .ipa installation requires developer tools
- **TestFlight is easiest** but requires Apple Developer account
- **Web version works too** - Visit your GitHub Pages URL on iPhone
- **For emergencies, always call 911 directly**

## 🆘 **Need Help?**

If you have issues:
1. **Check if build completed** in GitHub Actions
2. **Make sure .ipa file downloaded correctly**
3. **Try the web version first** as a backup
4. **Consider TestFlight** for easiest installation

Your emergency monitoring app is now ready for iOS! The native app provides the emergency audio bypass that web browsers can't offer. 🚨📱✅