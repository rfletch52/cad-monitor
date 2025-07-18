# 🚀 GitHub Actions Setup Guide - Build iOS/Android in the Cloud

Complete guide to set up automatic iOS and Android builds using GitHub Actions (no Mac required!).

## 🎯 **What This Does**

- ✅ **Builds iOS app** automatically on every push
- ✅ **Builds Android app** for immediate testing
- ✅ **Deploys web version** to Netlify
- ✅ **Creates downloadable files** (.ipa for iOS, .apk for Android)
- ✅ **Runs on GitHub's servers** - no Mac needed!

---

## 📋 **Setup Steps**

### **1. Push Code to GitHub**
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit - Winnipeg CAD Monitor"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/winnipeg-cad-monitor.git
git branch -M main
git push -u origin main
```

### **2. GitHub Actions Will Run Automatically**
- **iOS Build**: Runs on macOS runners (free for public repos)
- **Android Build**: Runs on Ubuntu runners
- **Web Deploy**: Deploys to Netlify automatically

### **3. Download Built Apps**
1. **Go to your GitHub repo**
2. **Click "Actions" tab**
3. **Click on latest workflow run**
4. **Download artifacts**:
   - `ios-app` - Contains .ipa file for iPhone
   - `android-debug-apk` - APK for Android testing
   - `android-release-apk` - Production Android APK

---

## 📱 **Installing on Friends' Phones**

### **iOS Installation (TestFlight Method)**
1. **Get Apple Developer Account** ($99/year)
2. **Upload .ipa to App Store Connect**
3. **Add friends as beta testers**
4. **They install via TestFlight app**

### **iOS Installation (Direct Method)**
1. **Get friends' device UUIDs**:
   ```bash
   # Friends connect iPhone to computer and run:
   # iTunes > iPhone > Summary > Serial Number (click to show UDID)
   ```
2. **Add UUIDs to provisioning profile**
3. **Rebuild with ad-hoc profile**
4. **Send .ipa file via AirDrop or email**

### **Android Installation (Easy)**
1. **Download .apk from GitHub Actions**
2. **Send to friends via email/messaging**
3. **Friends enable "Install from Unknown Sources"**
4. **Tap .apk file to install**

---

## 🔧 **Advanced Configuration**

### **Apple Developer Setup (for iOS)**
```bash
# Add these secrets to GitHub repository:
# Settings > Secrets and variables > Actions

APPLE_ID=your-apple-id@email.com
APP_SPECIFIC_PASSWORD=your-app-specific-password
TEAM_ID=your-team-id
```

### **Automatic TestFlight Upload**
```yaml
# Add to ios-build.yml for automatic TestFlight deployment
- name: Upload to TestFlight
  if: github.ref == 'refs/heads/main'
  run: |
    xcrun altool --upload-app \
                 --type ios \
                 --file ios/build/*.ipa \
                 --username "${{ secrets.APPLE_ID }}" \
                 --password "${{ secrets.APP_SPECIFIC_PASSWORD }}"
```

### **Android Signing (for Play Store)**
```bash
# Generate signing key
keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Add to GitHub secrets:
ANDROID_SIGNING_KEY=base64-encoded-keystore
ANDROID_KEY_ALIAS=my-key-alias
ANDROID_KEY_PASSWORD=your-password
ANDROID_STORE_PASSWORD=your-store-password
```

---

## 🧪 **Testing the Emergency Audio**

### **iOS Testing**
1. **Install .ipa on iPhone** (via TestFlight or direct)
2. **Put iPhone in silent mode**
3. **Open app and tap "Test Emergency Audio"**
4. **Audio should play even in silent mode!** 🔊

### **Android Testing**
1. **Install .apk on Android phone**
2. **Put phone in silent mode**
3. **Test emergency audio bypass**
4. **Verify strong vibration patterns**

---

## 📊 **Build Status**

### **Monitor Builds**
- **GitHub Actions tab** shows build status
- **Green checkmark** = successful build
- **Red X** = build failed (check logs)
- **Yellow circle** = build in progress

### **Build Artifacts**
- **Stored for 30 days** automatically
- **Download anytime** from Actions tab
- **New build on every push** to main branch

---

## 🚨 **Emergency Features in Native Apps**

### **iOS Emergency Audio**
```objc
// Native iOS audio session bypasses silent mode
[audioSession setCategory:AVAudioSessionCategoryPlayback
              withOptions:AVAudioSessionCategoryOptionDefaultToSpeaker];
```

### **Android Emergency Audio**
```java
// Android STREAM_ALARM bypasses silent mode
AudioManager.STREAM_ALARM
```

### **Background Monitoring**
- **iOS**: Background app refresh + push notifications
- **Android**: Foreground service for continuous monitoring
- **Both**: System-level notifications for critical incidents

---

## 🎉 **Success! You Now Have**

- ✅ **Automatic iOS builds** without owning a Mac
- ✅ **Android APKs** ready for immediate testing
- ✅ **Emergency audio** that bypasses silent mode
- ✅ **Easy distribution** to friends for testing
- ✅ **Professional CI/CD pipeline** for ongoing development

---

## 🆘 **Troubleshooting**

### **iOS Build Fails**
- Check Xcode version compatibility
- Verify bundle identifier is unique
- Ensure all dependencies are compatible

### **Android Build Fails**
- Check Java version (should be 17)
- Verify Android SDK versions
- Clear Gradle cache if needed

### **Emergency Audio Not Working**
- Ensure native permissions are granted
- Test on physical devices (not simulators)
- Check device-specific silent mode behavior

---

## 📞 **Emergency Disclaimer**

**⚠️ IMPORTANT: Always call 911 for emergencies**
- This app is supplementary monitoring only
- Do not rely solely on this app for emergency information
- Emergency services have official dispatch systems

**Your emergency monitoring app is now building automatically in the cloud! 🚨☁️📱✅**