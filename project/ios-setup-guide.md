# 📱 iOS Native App Setup Guide - Complete Walkthrough

This guide will walk you through converting your Winnipeg CAD Monitor web app to a **real iOS native app** that can play emergency audio even when the phone is on silent.

## 🚨 **Why iOS Native App?**

- ✅ **Emergency audio bypasses silent mode** - Uses native iOS audio APIs
- ✅ **Background monitoring** - Continues working when app is minimized  
- ✅ **System notifications** - Real push notifications on lock screen
- ✅ **Strong vibration** - Direct hardware access for emergency alerts
- ✅ **App Store distribution** - Professional app deployment

---

## 📋 **Prerequisites**

### **Required Software**
```bash
# 1. Install Xcode (from Mac App Store)
# - Xcode 14+ required
# - Includes iOS Simulator and build tools

# 2. Install Xcode Command Line Tools
xcode-select --install

# 3. Install Node.js 18+
brew install node

# 4. Install React Native CLI
npm install -g @react-native-community/cli

# 5. Install CocoaPods (iOS dependency manager)
sudo gem install cocoapods
```

### **Hardware Requirements**
- **Mac computer** (macOS 12+ recommended)
- **iPhone** (for testing on real device)
- **Apple Developer Account** (for App Store deployment)

---

## 🛠️ **Step 1: Project Setup**

### **Initialize React Native Project**
```bash
# Navigate to your project directory
cd winnipeg-cad-monitor-app

# Install all dependencies
npm install

# Install iOS-specific dependencies
cd ios
pod install
cd ..
```

### **Verify Installation**
```bash
# Check React Native setup
npx react-native doctor

# Should show all green checkmarks for iOS
```

---

## 🔧 **Step 2: iOS Configuration**

### **Key iOS Files Created:**

1. **`ios/Podfile`** - iOS dependency management
2. **`ios/WinnipegCADMonitor.xcodeproj/`** - Xcode project file
3. **`ios/WinnipegCADMonitor/Info.plist`** - App permissions and settings
4. **`ios/WinnipegCADMonitor/AppDelegate.mm`** - App lifecycle and audio setup
5. **`ios/WinnipegCADMonitor/emergency_alert.mp3`** - Emergency sound file

### **Critical iOS Permissions (Info.plist):**
```xml
<!-- Microphone for emergency audio -->
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access to play emergency audio alerts that bypass silent mode.</string>

<!-- Location for emergency alerts -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to provide location-based emergency alerts.</string>

<!-- Background modes for monitoring -->
<key>UIBackgroundModes</key>
<array>
    <string>background-fetch</string>
    <string>background-processing</string>
    <string>audio</string>
</array>
```

---

## 📱 **Step 3: Building and Testing**

### **Run on iOS Simulator**
```bash
# Start Metro bundler (in one terminal)
npm start

# Run on iOS simulator (in another terminal)
npm run ios

# Or specify simulator
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### **Run on Physical iPhone**
```bash
# Connect iPhone via USB cable
# Enable "Developer Mode" in iPhone Settings > Privacy & Security

# Run on connected device
npx react-native run-ios --device

# Or specify device name
npx react-native run-ios --device "Your iPhone Name"
```

---

## 🔊 **Step 4: Emergency Audio System**

### **How It Works:**
1. **Native Audio Session**: Configured in `AppDelegate.mm` to bypass silent mode
2. **Emergency Sound File**: `emergency_alert.mp3` bundled with app
3. **React Native Sound**: Native library that can play audio regardless of ringer settings
4. **Background Audio**: Continues playing even when app is backgrounded

### **Audio Configuration (AppDelegate.mm):**
```objc
// Configure audio session for emergency alerts
- (void)configureAudioSession
{
  AVAudioSession *audioSession = [AVAudioSession sharedInstance];
  
  // Set category to playback with options to bypass silent mode
  [audioSession setCategory:AVAudioSessionCategoryPlayback
                withOptions:AVAudioSessionCategoryOptionMixWithOthers |
                           AVAudioSessionCategoryOptionDuckOthers |
                           AVAudioSessionCategoryOptionDefaultToSpeaker
                      error:nil];
  
  [audioSession setActive:YES error:nil];
}
```

### **Testing Emergency Audio:**
1. **Put iPhone in silent mode** (flip silent switch)
2. **Open the app**
3. **Tap "Test Emergency Audio"** button
4. **Audio should play** even in silent mode! 🔊

---

## 🚀 **Step 5: Xcode Project Setup**

### **Open in Xcode:**
```bash
# Open the iOS project in Xcode
open ios/WinnipegCADMonitor.xcworkspace
```

### **Key Xcode Configurations:**

#### **1. Bundle Identifier**
- Set to: `com.winnipegcadmonitor`
- Must be unique for App Store

#### **2. Signing & Capabilities**
- **Team**: Select your Apple Developer Team
- **Signing Certificate**: Automatic signing recommended
- **Capabilities**: 
  - Background Modes ✅
  - Push Notifications ✅
  - Audio ✅

#### **3. Build Settings**
- **iOS Deployment Target**: 12.4+
- **Architecture**: arm64 (for physical devices)
- **Build Configuration**: Debug/Release

#### **4. Info.plist Permissions**
- Microphone Usage ✅
- Location When In Use ✅
- Background Modes ✅

---

## 📦 **Step 6: App Store Preparation**

### **Create App Icons**
1. **Generate icon set** (1024x1024 base image)
2. **Add to** `ios/WinnipegCADMonitor/Images.xcassets/AppIcon.appiconset/`
3. **Required sizes**: 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

### **App Store Connect Setup**
1. **Create app** in App Store Connect
2. **Set bundle ID**: `com.winnipegcadmonitor`
3. **Upload screenshots** (required for submission)
4. **Write app description** focusing on emergency monitoring

### **Build for Release**
```bash
# In Xcode:
# 1. Select "Any iOS Device" as target
# 2. Product > Archive
# 3. Upload to App Store Connect
# 4. Submit for review
```

---

## 🧪 **Step 7: Testing Checklist**

### **Simulator Testing**
- ✅ App launches successfully
- ✅ UI displays correctly
- ✅ CAD data loads
- ✅ Navigation works
- ✅ Settings save/load

### **Physical Device Testing**
- ✅ Emergency audio plays in silent mode
- ✅ Vibration works
- ✅ Push notifications appear
- ✅ Background monitoring continues
- ✅ Screen stays awake when enabled
- ✅ App works on cellular data

### **Emergency Audio Testing**
```bash
# Test sequence:
1. Put phone in silent mode
2. Open app
3. Enable alerts in settings
4. Tap "Test Emergency Audio"
5. Audio should play loudly! 🚨
```

---

## 🔧 **Step 8: Troubleshooting**

### **Common Issues:**

#### **"No bundle URL present" Error**
```bash
# Reset Metro cache
npx react-native start --reset-cache

# Clean build
cd ios && xcodebuild clean && cd ..
```

#### **CocoaPods Issues**
```bash
# Update CocoaPods
cd ios
pod repo update
pod install --repo-update
cd ..
```

#### **Audio Not Working**
1. **Check permissions** in iPhone Settings > Privacy > Microphone
2. **Verify audio session** configuration in AppDelegate.mm
3. **Test with volume up** - some devices need volume > 0
4. **Check silent switch** - should work even when on

#### **Build Errors**
```bash
# Clean everything
cd ios
xcodebuild clean
rm -rf build/
rm -rf ~/Library/Developer/Xcode/DerivedData/
pod install
cd ..
npm start --reset-cache
```

---

## 📊 **Step 9: Performance Optimization**

### **Battery Optimization**
- **Background refresh**: Only when alerts enabled
- **Location services**: Only when needed
- **Network requests**: Efficient polling intervals

### **Memory Management**
- **Incident limit**: Keep only last 100 incidents
- **Image optimization**: Use appropriate sizes
- **Cache management**: Clear old data periodically

---

## 🚀 **Step 10: Deployment**

### **TestFlight (Beta Testing)**
1. **Archive in Xcode**
2. **Upload to App Store Connect**
3. **Add beta testers**
4. **Distribute for testing**

### **App Store Release**
1. **Complete app metadata**
2. **Upload screenshots**
3. **Submit for review**
4. **Wait for approval** (1-7 days)
5. **Release to App Store**

---

## 🎉 **Success! You Now Have:**

- ✅ **Real iOS native app** that bypasses silent mode
- ✅ **Emergency audio alerts** that work 24/7
- ✅ **Professional app** ready for App Store
- ✅ **Background monitoring** for critical incidents
- ✅ **Push notifications** on lock screen
- ✅ **Strong vibration** for emergency alerts

---

## 📞 **Emergency Disclaimer**

**⚠️ IMPORTANT: This app is for informational purposes only.**

- **Always call 911 for emergencies**
- **Do not rely solely on this app**
- **Use as supplementary monitoring tool**
- **Emergency services have official dispatch systems**

---

## 🆘 **Need Help?**

If you encounter issues during setup:

1. **Check React Native docs**: https://reactnative.dev/docs/environment-setup
2. **iOS troubleshooting**: https://reactnative.dev/docs/troubleshooting
3. **Xcode help**: Use Xcode's built-in documentation
4. **Community support**: React Native GitHub discussions

**Your emergency monitoring app is now ready for iOS! 🚨📱✅**