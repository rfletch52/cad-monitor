# Winnipeg CAD Monitor - Native Mobile App

A **real native mobile app** for monitoring Winnipeg's emergency dispatch system with **emergency audio alerts that bypass silent mode**.

## 🚨 **Why Native App?**

Web browsers have strict limitations that prevent emergency audio from playing when phones are on silent. This native app solves that problem by:

- ✅ **Playing emergency audio even in silent mode**
- ✅ **Strong vibration patterns that work reliably**
- ✅ **Background monitoring with push notifications**
- ✅ **Proper system-level audio permissions**
- ✅ **Keep screen awake during monitoring**

## 📱 **Features**

### **Emergency Audio System**
- **Bypasses silent mode**: Uses native audio APIs that can play emergency sounds
- **Multiple alert types**: Critical, High, Medium priority with different sounds/vibrations
- **Background operation**: Continues monitoring even when app is minimized
- **Push notifications**: System-level notifications for critical incidents

### **Real-Time Monitoring**
- **Live CAD data**: Direct connection to Winnipeg's official dispatch system
- **Instant alerts**: Immediate notification of critical incidents
- **Unit tracking**: Monitor emergency unit deployments and responses
- **Neighborhood filtering**: Focus on specific areas of interest

### **Mobile-Optimized Interface**
- **Touch-friendly design**: Large buttons and easy navigation
- **Dark mode support**: Easy viewing during night monitoring
- **Swipe gestures**: Quick actions and navigation
- **Offline capability**: Cached data when network is unavailable

## 🛠️ **Installation & Setup**

### **Prerequisites**
```bash
# Install Node.js 18+
# Install React Native CLI
npm install -g @react-native-community/cli

# For iOS development
# Install Xcode from App Store
# Install CocoaPods
sudo gem install cocoapods

# For Android development
# Install Android Studio
# Set up Android SDK and emulator
```

### **Clone and Install**
```bash
git clone <repository-url>
cd winnipeg-cad-monitor-app
npm install

# iOS setup
cd ios && pod install && cd ..

# Android setup (if needed)
cd android && ./gradlew clean && cd ..
```

### **Run the App**

#### **iOS (Simulator)**
```bash
npm run ios
```

#### **iOS (Physical Device)**
```bash
# Connect iPhone via USB
# Enable Developer Mode in Settings > Privacy & Security
npm run ios --device
```

#### **Android (Emulator)**
```bash
# Start Android emulator first
npm run android
```

#### **Android (Physical Device)**
```bash
# Enable USB Debugging in Developer Options
# Connect Android phone via USB
npm run android
```

## 🔧 **App Configuration**

### **Emergency Audio Setup**
1. **Grant Permissions**: App will request microphone and notification permissions
2. **Test Emergency Audio**: Use the red test button to verify audio works in silent mode
3. **Configure Alerts**: Set up neighborhoods, incident types, and priority levels
4. **Enable Background**: Allow app to run in background for continuous monitoring

### **Alert Settings**
- **Priority Levels**: Choose which incident priorities trigger alerts
- **Neighborhoods**: Select specific Winnipeg neighborhoods to monitor
- **Incident Types**: Filter by emergency type (fire, medical, MVI, etc.)
- **Audio/Vibration**: Customize alert sounds and vibration patterns

## 📋 **Permissions Required**

### **iOS Permissions**
- **Microphone**: Required for emergency audio that bypasses silent mode
- **Notifications**: For push notifications when app is backgrounded
- **Background App Refresh**: Keeps monitoring active when app is minimized

### **Android Permissions**
- **Modify Audio Settings**: Required for emergency audio bypass
- **Vibrate**: For emergency vibration alerts
- **Wake Lock**: Keeps screen awake during active monitoring
- **Foreground Service**: Background monitoring capability
- **System Alert Window**: Emergency overlay alerts

## 🚀 **Building for Production**

### **iOS App Store**
```bash
# Build release version
npx react-native run-ios --configuration Release

# Archive in Xcode
# Upload to App Store Connect
# Submit for review
```

### **Android Play Store**
```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Upload to Google Play Console
# Submit for review
```

## 🔍 **Troubleshooting**

### **Audio Not Working**
1. **Check permissions**: Ensure microphone permission is granted
2. **Test in silent mode**: Use the emergency test button
3. **Restart app**: Close and reopen to reinitialize audio system
4. **Check device settings**: Ensure app has notification permissions

### **Background Monitoring Issues**
1. **Battery optimization**: Disable battery optimization for the app
2. **Background app refresh**: Enable in device settings
3. **Notification permissions**: Ensure all notification types are allowed

### **Build Issues**
```bash
# Clean and rebuild
npm run clean
npm install
cd ios && pod install && cd ..
npm run ios
```

## 📞 **Emergency Disclaimer**

**⚠️ IMPORTANT: This app is for informational purposes only.**

- **Always call 911 for emergencies**
- **Do not rely solely on this app for emergency information**
- **Use as supplementary monitoring tool only**
- **Emergency services have official dispatch systems**

## 🤝 **Contributing**

This native app provides the emergency audio capabilities that web browsers cannot. Contributions welcome for:

- Enhanced audio alert systems
- Additional emergency notification methods
- iOS/Android platform optimizations
- Background monitoring improvements

## 📄 **License**

MIT License - Emergency monitoring for public safety.

---

## 🆘 **For Emergencies: Call 911 Directly**

This app enhances situational awareness but should never replace official emergency services.