# 🤖 Android Emergency App Setup Guide (PC)

Complete guide to convert your Winnipeg CAD Monitor to a native Android app that can bypass silent mode for emergency alerts.

## 🚨 **Why Android Native App?**

- ✅ **Emergency audio bypasses silent mode** - Uses Android STREAM_ALARM
- ✅ **Develop on PC** - Android Studio runs on Windows
- ✅ **Strong vibration patterns** - Direct hardware access
- ✅ **Background monitoring** - Foreground services
- ✅ **System notifications** - Real push notifications
- ✅ **Easy deployment** - Google Play Store or direct APK

---

## 📋 **Prerequisites (PC Setup)**

### **Required Software**
```bash
# 1. Download and install Android Studio
# https://developer.android.com/studio
# - Includes Android SDK and emulator
# - Choose "Standard" installation

# 2. Install Node.js 18+
# https://nodejs.org/
# Download Windows installer

# 3. Install React Native CLI
npm install -g @react-native-community/cli

# 4. Install Java Development Kit (JDK 11)
# Android Studio should install this automatically
```

### **Android Studio Setup**
1. **Open Android Studio**
2. **SDK Manager** → Install latest Android SDK
3. **AVD Manager** → Create virtual device for testing
4. **Enable Developer Options** on physical Android phone

### **Environment Variables (Windows)**
```bash
# Add to System Environment Variables:
ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Android\Android Studio\jre

# Add to PATH:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

---

## 🛠️ **Step 1: Convert to React Native**

### **Initialize React Native Project**
```bash
# Navigate to your project directory
cd winnipeg-cad-monitor-app

# Install React Native dependencies
npm install react-native@latest
npm install @react-native-community/cli@latest

# Install Android-specific packages
npm install react-native-sound
npm install react-native-push-notification
npm install react-native-keep-awake
npm install react-native-permissions
npm install @react-native-async-storage/async-storage
```

### **Android Project Structure**
```
android/
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/com/winnipegcadmonitor/
│   │   └── res/
│   └── build.gradle
├── gradle/
└── settings.gradle
```

---

## 🔧 **Step 2: Android Configuration**

### **AndroidManifest.xml Permissions**
```xml
<!-- Emergency audio and vibration -->
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- Background monitoring -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

<!-- Network and notifications -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NOTIFICATION_POLICY" />
```

### **Emergency Audio Service**
```javascript
// src/services/androidAudioService.js
import Sound from 'react-native-sound';
import { Vibration, PermissionsAndroid } from 'react-native';

// Configure Sound for emergency bypass
Sound.setCategory('Alarm', true); // Uses STREAM_ALARM - bypasses silent mode

class AndroidAudioService {
  constructor() {
    this.emergencySound = null;
    this.initializeEmergencySound();
  }

  initializeEmergencySound() {
    // Load emergency sound file
    this.emergencySound = new Sound('emergency_alert.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.error('Failed to load emergency sound:', error);
      } else {
        console.log('✅ Emergency sound loaded successfully');
      }
    });
  }

  async playEmergencyAlert() {
    console.log('🚨 Playing emergency alert - bypassing silent mode');
    
    try {
      // Play emergency sound at maximum volume
      if (this.emergencySound) {
        this.emergencySound.setVolume(1.0); // Maximum volume
        this.emergencySound.play((success) => {
          if (success) {
            console.log('✅ Emergency sound played successfully');
          } else {
            console.error('❌ Failed to play emergency sound');
          }
        });
      }

      // Trigger strong vibration pattern
      const vibrationPattern = [0, 1000, 200, 1000, 200, 1000]; // Strong pattern
      Vibration.vibrate(vibrationPattern, false);
      
      console.log('✅ Emergency alert completed');
    } catch (error) {
      console.error('❌ Error playing emergency alert:', error);
    }
  }

  async requestPermissions() {
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.VIBRATE,
        PermissionsAndroid.PERMISSIONS.MODIFY_AUDIO_SETTINGS,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      
      const allGranted = Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED
      );

      if (allGranted) {
        console.log('✅ All emergency permissions granted');
      } else {
        console.warn('⚠️ Some emergency permissions denied');
      }

      return allGranted;
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  }
}

export const androidAudioService = new AndroidAudioService();
```

---

## 🚀 **Step 3: Building and Testing**

### **Run on Android Emulator**
```bash
# Start Android emulator from Android Studio
# Or use command line:
emulator -avd YourAVDName

# Start Metro bundler
npm start

# Run on emulator
npm run android
```

### **Run on Physical Android Device**
```bash
# Enable USB Debugging on Android phone:
# Settings > Developer Options > USB Debugging

# Connect phone via USB
# Verify device is connected:
adb devices

# Run on device
npm run android
```

### **Test Emergency Audio**
1. **Put Android phone in silent mode**
2. **Open the app**
3. **Tap "Test Emergency Audio"**
4. **Audio should play loudly even in silent mode!** 🔊

---

## 🔧 **Step 4: Emergency Features Implementation**

### **Background Monitoring Service**
```javascript
// android/app/src/main/java/com/winnipegcadmonitor/CADMonitorService.java
public class CADMonitorService extends Service {
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Create foreground notification
        createNotificationChannel();
        startForeground(1, createNotification());
        
        // Start monitoring CAD data
        startCADMonitoring();
        
        return START_STICKY; // Restart if killed
    }
    
    private void startCADMonitoring() {
        // Poll CAD API every 30 seconds
        // Trigger emergency alerts for critical incidents
    }
}
```

### **Push Notifications**
```javascript
// src/services/notificationService.js
import PushNotification from 'react-native-push-notification';

PushNotification.configure({
  onNotification: function(notification) {
    console.log('📱 Notification received:', notification);
  },
  requestPermissions: true,
});

export const showEmergencyNotification = (incident) => {
  PushNotification.localNotification({
    title: '🚨 CRITICAL EMERGENCY',
    message: `${incident.type} in ${incident.neighborhood}`,
    playSound: true,
    soundName: 'emergency_alert.mp3',
    importance: 'high',
    priority: 'high',
    vibrate: true,
    vibration: 1000,
  });
};
```

---

## 📦 **Step 5: Building Release APK**

### **Generate Signed APK**
```bash
# Navigate to android directory
cd android

# Generate release APK
./gradlew assembleRelease

# APK will be created at:
# android/app/build/outputs/apk/release/app-release.apk
```

### **Install APK on Device**
```bash
# Install directly on connected device
adb install android/app/build/outputs/apk/release/app-release.apk

# Or copy APK to phone and install manually
```

---

## 🏪 **Step 6: Google Play Store Deployment**

### **Prepare for Play Store**
1. **Create Google Play Console account** ($25 one-time fee)
2. **Generate signed bundle**: `./gradlew bundleRelease`
3. **Upload to Play Console**
4. **Fill out store listing**
5. **Submit for review**

### **Store Listing Requirements**
- **App screenshots** (phone and tablet)
- **App description** focusing on emergency monitoring
- **Privacy policy** (required for apps with permissions)
- **Content rating** (appropriate for emergency app)

---

## 🧪 **Step 7: Testing Checklist**

### **Emergency Audio Testing**
- ✅ Audio plays in silent mode
- ✅ Audio plays at maximum volume
- ✅ Vibration works with different patterns
- ✅ Background monitoring continues
- ✅ Notifications appear on lock screen

### **Performance Testing**
- ✅ App doesn't drain battery excessively
- ✅ Background service stays active
- ✅ Network requests work on cellular data
- ✅ App handles network interruptions

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **"SDK location not found"**
```bash
# Create local.properties file in android/ directory:
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

#### **"Unable to load script"**
```bash
# Reset Metro cache
npm start -- --reset-cache

# Clean build
cd android && ./gradlew clean && cd ..
```

#### **Audio not bypassing silent mode**
1. **Check permissions** in Android Settings > Apps > Your App > Permissions
2. **Verify Sound category** is set to 'Alarm'
3. **Test on different Android versions** (behavior varies)

---

## 🎉 **Success! You Now Have:**

- ✅ **Real Android app** that bypasses silent mode
- ✅ **Emergency audio alerts** that work 24/7
- ✅ **Background monitoring** for critical incidents
- ✅ **System notifications** on lock screen
- ✅ **Strong vibration** for emergency alerts
- ✅ **Professional app** ready for Google Play Store

---

## 📞 **Emergency Disclaimer**

**⚠️ IMPORTANT: This app is for informational purposes only.**

- **Always call 911 for emergencies**
- **Do not rely solely on this app**
- **Use as supplementary monitoring tool**
- **Emergency services have official dispatch systems**

---

## 🆘 **Need Help?**

If you encounter issues:

1. **Check React Native docs**: https://reactnative.dev/docs/environment-setup
2. **Android troubleshooting**: https://reactnative.dev/docs/troubleshooting
3. **Stack Overflow**: Search for specific error messages
4. **React Native community**: GitHub discussions

**Your emergency monitoring app is now ready for Android! 🚨📱✅**