# 📱 Enhanced PWA Guide - Better Mobile Experience

Since you're on PC, let's enhance your current web app to work more like a native app while we plan the Android development.

## 🚀 **Progressive Web App (PWA) Enhancements**

### **What We Can Improve Immediately:**
- ✅ **Install like native app** - Add to home screen
- ✅ **Better mobile experience** - Full screen, native feel
- ✅ **Background sync** - Service workers for monitoring
- ✅ **Web push notifications** - System-level alerts
- ✅ **Offline capability** - Works without internet
- ✅ **Improved audio handling** - Better mobile compatibility

---

## 📋 **PWA Manifest Configuration**

### **Create Web App Manifest**
```json
// public/manifest.json
{
  "name": "Winnipeg CAD Monitor - Emergency System",
  "short_name": "CAD Monitor",
  "description": "Live emergency incident monitoring for Winnipeg",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#dc2626",
  "background_color": "#ffffff",
  "categories": ["emergency", "safety", "utilities"],
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png", 
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Emergency Alerts",
      "short_name": "Alerts",
      "description": "Configure emergency alert settings",
      "url": "/?alerts=true",
      "icons": [{"src": "/alert-icon.png", "sizes": "96x96"}]
    }
  ]
}
```

---

## 🔧 **Service Worker for Background Monitoring**

### **Background Sync Implementation**
```javascript
// public/sw.js - Service Worker
const CACHE_NAME = 'cad-monitor-v1';
const CAD_API_URL = 'https://data.winnipeg.ca/resource/yg42-q284.json';

// Install service worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/static/js/bundle.js',
        '/static/css/main.css',
        '/manifest.json'
      ]);
    })
  );
});

// Background sync for monitoring
self.addEventListener('sync', (event) => {
  if (event.tag === 'cad-monitor-sync') {
    console.log('🔄 Background sync: Checking for new incidents');
    event.waitUntil(checkForCriticalIncidents());
  }
});

// Check for critical incidents in background
async function checkForCriticalIncidents() {
  try {
    const response = await fetch(`${CAD_API_URL}?$limit=50&$order=call_time DESC`);
    const incidents = await response.json();
    
    // Check for critical incidents in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const criticalIncidents = incidents.filter(incident => {
      const incidentTime = new Date(incident.call_time);
      return incidentTime > fiveMinutesAgo && 
             (incident.incident_type?.toLowerCase().includes('fire') ||
              incident.incident_type?.toLowerCase().includes('cardiac'));
    });
    
    // Send push notification for critical incidents
    if (criticalIncidents.length > 0) {
      await sendPushNotification(criticalIncidents[0]);
    }
    
  } catch (error) {
    console.error('❌ Background sync error:', error);
  }
}

// Send push notification
async function sendPushNotification(incident) {
  const title = '🚨 CRITICAL EMERGENCY ALERT';
  const options = {
    body: `${incident.incident_type} in ${incident.neighbourhood}`,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'critical-incident',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/dismiss-icon.png'
      }
    ]
  };
  
  await self.registration.showNotification(title, options);
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    // Open app to incident details
    event.waitUntil(
      clients.openWindow('/?incident=' + event.notification.tag)
    );
  }
});
```

---

## 📱 **Enhanced Mobile Audio System**

### **Improved Audio Service**
```javascript
// src/services/enhancedAudioService.js
class EnhancedAudioService {
  constructor() {
    this.audioContext = null;
    this.audioElements = new Map();
    this.isInitialized = false;
    this.userInteracted = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Create multiple audio elements for reliability
      this.createAudioElements();
      
      // Request wake lock for emergency monitoring
      await this.requestWakeLock();
      
      // Setup user interaction listeners
      this.setupInteractionListeners();
      
      this.isInitialized = true;
      console.log('✅ Enhanced audio service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize enhanced audio:', error);
    }
  }

  createAudioElements() {
    const sounds = ['emergency', 'alert', 'notification'];
    
    sounds.forEach(soundType => {
      const audio = new Audio();
      
      // Generate emergency tone as data URL
      const audioData = this.generateEmergencyTone(soundType);
      audio.src = audioData;
      audio.preload = 'auto';
      audio.volume = 1.0;
      
      // Configure for emergency playback
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      
      this.audioElements.set(soundType, audio);
    });
  }

  generateEmergencyTone(type) {
    const sampleRate = 44100;
    const duration = 2; // 2 seconds
    const frequency = type === 'emergency' ? 1000 : 800;
    
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate sine wave
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.8;
      view.setInt16(44 + i * 2, sample * 32767, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  async playEmergencyAlert(alertType = 'emergency') {
    console.log(`🚨 Playing emergency alert: ${alertType}`);
    
    if (!this.userInteracted) {
      console.warn('⚠️ User interaction required for audio');
      return false;
    }
    
    try {
      // Try multiple audio methods simultaneously
      const promises = [];
      
      // Method 1: HTML5 Audio element
      const audioElement = this.audioElements.get(alertType);
      if (audioElement) {
        promises.push(this.playAudioElement(audioElement));
      }
      
      // Method 2: Web Audio API
      promises.push(this.playWebAudioTone());
      
      // Method 3: Multiple audio elements
      promises.push(this.playMultipleAudioElements());
      
      // Play all methods, use first successful one
      const results = await Promise.allSettled(promises);
      const successful = results.some(result => result.status === 'fulfilled');
      
      if (successful) {
        console.log('✅ Emergency alert played successfully');
        
        // Trigger vibration
        this.triggerVibration(alertType);
        
        return true;
      } else {
        console.error('❌ All audio methods failed');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error playing emergency alert:', error);
      return false;
    }
  }

  async playAudioElement(audioElement) {
    audioElement.currentTime = 0;
    audioElement.volume = 1.0;
    
    return new Promise((resolve, reject) => {
      const playPromise = audioElement.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✅ Audio element played successfully');
            resolve();
          })
          .catch(reject);
      } else {
        resolve();
      }
    });
  }

  triggerVibration(alertType) {
    if ('vibrate' in navigator) {
      const patterns = {
        emergency: [500, 200, 500, 200, 500, 200, 500],
        alert: [300, 100, 300, 100, 300],
        notification: [200, 100, 200]
      };
      
      const pattern = patterns[alertType] || patterns.alert;
      
      // Try vibration multiple times for reliability
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          navigator.vibrate(pattern);
        }, i * 100);
      }
      
      console.log('✅ Vibration triggered');
    }
  }

  setupInteractionListeners() {
    const events = ['touchstart', 'touchend', 'click', 'keydown'];
    
    const handleInteraction = () => {
      this.userInteracted = true;
      console.log('✅ User interaction detected - audio unlocked');
      
      // Remove listeners after first interaction
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
    
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true });
    });
  }

  async requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('✅ Wake lock acquired - screen will stay awake');
      } catch (error) {
        console.warn('⚠️ Wake lock failed:', error);
      }
    }
  }
}

export const enhancedAudioService = new EnhancedAudioService();
```

---

## 🔔 **Web Push Notifications**

### **Push Notification Setup**
```javascript
// src/services/pushNotificationService.js
class PushNotificationService {
  constructor() {
    this.registration = null;
    this.subscription = null;
  }

  async initialize() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        // Register service worker
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered');
        
        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('✅ Notification permission granted');
          await this.subscribeToPush();
        }
        
      } catch (error) {
        console.error('❌ Push notification setup failed:', error);
      }
    }
  }

  async subscribeToPush() {
    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      
      this.subscription = subscription;
      console.log('✅ Push subscription created');
      
      // Send subscription to server (if you have one)
      // await this.sendSubscriptionToServer(subscription);
      
    } catch (error) {
      console.error('❌ Push subscription failed:', error);
    }
  }

  async showLocalNotification(title, options) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        ...options
      });
      
      // Auto-close after 10 seconds unless it requires interaction
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 10000);
      }
      
      return notification;
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const pushNotificationService = new PushNotificationService();
```

---

## 📱 **Install Prompt Enhancement**

### **Add to Home Screen Prompt**
```javascript
// src/components/InstallPrompt.jsx
import React, { useState, useEffect } from 'react';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      } else {
        console.log('❌ User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm">📱 Install Emergency App</h3>
          <p className="text-xs opacity-90">Get faster access and better notifications</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="px-3 py-1 text-xs bg-red-700 rounded hover:bg-red-800"
          >
            Later
          </button>
          <button
            onClick={handleInstallClick}
            className="px-3 py-1 text-xs bg-white text-red-600 rounded hover:bg-gray-100"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 🎯 **Next Steps**

### **Immediate PWA Enhancements (Today)**
1. **Add manifest.json** to make app installable
2. **Implement service worker** for background monitoring
3. **Setup push notifications** for critical alerts
4. **Add install prompt** for better user experience
5. **Enhance audio system** with multiple fallbacks

### **Android Development (Next Week)**
1. **Setup Android Studio** on your PC
2. **Convert to React Native** Android app
3. **Implement native emergency audio** that bypasses silent mode
4. **Test on Android device**
5. **Deploy to Google Play Store**

Would you like me to implement these PWA enhancements first while you set up Android development environment?

## 🆘 **Emergency Disclaimer**

**⚠️ IMPORTANT: Always call 911 for emergencies**
- This app is supplementary monitoring only
- Do not rely solely on this app for emergency information
- Emergency services have official dispatch systems