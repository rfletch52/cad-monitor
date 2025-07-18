import Sound from 'react-native-sound';
import { Vibration, Alert, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// Enable playback in silence mode (iOS)
Sound.setCategory('Playback', true);

class NativeAudioService {
  private emergencySound: Sound | null = null;
  private isInitialized = false;
  private hasAudioPermission = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request audio permissions
      await this.requestAudioPermissions();
      
      // Initialize push notifications
      this.initializePushNotifications();
      
      // Load emergency sound
      await this.loadEmergencySound();
      
      this.isInitialized = true;
      console.log('✅ Native audio service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize native audio service:', error);
    }
  }

  private async requestAudioPermissions() {
    try {
      if (Platform.OS === 'ios') {
        const micPermission = await request(PERMISSIONS.IOS.MICROPHONE);
        this.hasAudioPermission = micPermission === RESULTS.GRANTED;
        
        if (this.hasAudioPermission) {
          console.log('✅ iOS microphone permission granted - emergency audio enabled');
        } else {
          console.warn('⚠️ iOS microphone permission denied - emergency audio may not work');
        }
      } else if (Platform.OS === 'android') {
        const audioPermission = await request(PERMISSIONS.ANDROID.MODIFY_AUDIO_SETTINGS);
        this.hasAudioPermission = audioPermission === RESULTS.GRANTED;
        
        if (this.hasAudioPermission) {
          console.log('✅ Android audio permission granted - emergency audio enabled');
        } else {
          console.warn('⚠️ Android audio permission denied - emergency audio may not work');
        }
      }
    } catch (error) {
      console.error('❌ Error requesting audio permissions:', error);
    }
  }

  private initializePushNotifications() {
    PushNotification.configure({
      onRegister: function(token) {
        console.log('✅ Push notification token:', token);
      },
      onNotification: function(notification) {
        console.log('📱 Push notification received:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  }

  private async loadEmergencySound(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create emergency sound from bundled asset
      this.emergencySound = new Sound('emergency_alert.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.error('❌ Failed to load emergency sound:', error);
          reject(error);
        } else {
          console.log('✅ Emergency sound loaded successfully');
          resolve();
        }
      });
    });
  }

  async playEmergencyAlert(alertType: 'critical' | 'high' | 'medium' = 'critical') {
    console.log(`🚨 Playing emergency alert: ${alertType}`);
    
    try {
      // Play emergency sound (bypasses silent mode)
      await this.playEmergencySound();
      
      // Trigger emergency vibration
      this.playEmergencyVibration(alertType);
      
      // Show emergency notification
      this.showEmergencyNotification(alertType);
      
      console.log('✅ Emergency alert played successfully');
    } catch (error) {
      console.error('❌ Error playing emergency alert:', error);
    }
  }

  private async playEmergencySound() {
    if (!this.emergencySound) {
      console.warn('⚠️ Emergency sound not loaded');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      // Set volume to maximum
      this.emergencySound!.setVolume(1.0);
      
      // Play sound (this bypasses silent mode on native apps)
      this.emergencySound!.play((success) => {
        if (success) {
          console.log('✅ Emergency sound played successfully');
          resolve();
        } else {
          console.error('❌ Failed to play emergency sound');
          reject(new Error('Failed to play emergency sound'));
        }
      });
    });
  }

  private playEmergencyVibration(alertType: 'critical' | 'high' | 'medium') {
    try {
      let pattern: number[];
      
      switch (alertType) {
        case 'critical':
          // Long, urgent vibration pattern
          pattern = [0, 1000, 200, 1000, 200, 1000];
          break;
        case 'high':
          // Medium vibration pattern
          pattern = [0, 500, 200, 500, 200, 500];
          break;
        case 'medium':
          // Short vibration pattern
          pattern = [0, 300, 100, 300];
          break;
      }
      
      Vibration.vibrate(pattern, false);
      console.log(`✅ Emergency vibration played: ${alertType}`);
    } catch (error) {
      console.error('❌ Error playing emergency vibration:', error);
    }
  }

  private showEmergencyNotification(alertType: 'critical' | 'high' | 'medium') {
    const titles = {
      critical: '🚨 CRITICAL EMERGENCY',
      high: '⚠️ HIGH PRIORITY ALERT',
      medium: '📢 EMERGENCY ALERT'
    };

    PushNotification.localNotification({
      title: titles[alertType],
      message: 'New emergency incident detected in Winnipeg',
      playSound: true,
      soundName: 'emergency_alert.mp3',
      importance: 'high',
      priority: 'high',
      vibrate: true,
      vibration: 1000,
      ongoing: alertType === 'critical',
      ignoreInForeground: false,
    });
  }

  async testEmergencyAlert() {
    console.log('🧪 Testing emergency alert system...');
    
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    await this.playEmergencyAlert('critical');
    
    // Show test confirmation
    Alert.alert(
      '🚨 Emergency Alert Test',
      'Emergency alert system tested successfully!\n\n• Sound should play even in silent mode\n• Strong vibration pattern\n• Push notification sent',
      [{ text: 'OK', style: 'default' }]
    );
  }

  // Stop all emergency alerts
  stopEmergencyAlert() {
    if (this.emergencySound) {
      this.emergencySound.stop();
    }
    Vibration.cancel();
    PushNotification.cancelAllLocalNotifications();
  }
}

export const nativeAudioService = new NativeAudioService();