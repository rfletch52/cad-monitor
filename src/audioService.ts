class AudioService {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private wakeLock: WakeLockSentinel | null = null;
  private userInteracted = false;

  private initializeAudio() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    try {
      // Check if AudioContext is available (some mobile browsers block it)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('AudioContext not supported on this device');
        return;
      }
      
      this.audioContext = new AudioContextClass();
      this.isInitialized = true;
      console.log('Audio context initialized successfully');
      
      // Add user interaction listener for mobile
      this.addUserInteractionListener();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  private addUserInteractionListener() {
    const handleUserInteraction = () => {
      this.userInteracted = true;
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.log('Audio context resumed after user interaction');
        });
      }
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
    
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('click', handleUserInteraction, { once: true });
  }

  private async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('Audio context resumed');
      } catch (error) {
        console.error('Failed to resume audio context:', error);
      }
    }
  }

  // Vibration patterns for different alert types
  private getVibrationPattern(alertSound: 'beep' | 'siren' | 'chime' | 'horn'): number[] {
    switch (alertSound) {
      case 'beep':
        return [200]; // Single short vibration
      case 'siren':
        return [300, 100, 300, 100, 300]; // Alternating pattern
      case 'chime':
        return [100, 50, 100, 50, 100]; // Light triple tap
      case 'horn':
        return [500]; // Single long vibration
      default:
        return [200];
    }
  }

  private async vibrate(pattern: number[]) {
    if ('vibrate' in navigator) {
      try {
        const success = navigator.vibrate(pattern);
        console.log('Vibration triggered:', success ? 'success' : 'failed');
        return success;
      } catch (error) {
        console.warn('Vibration not supported or failed:', error);
        return false;
      }
    }
    console.warn('Vibration API not available');
    return false;
  }

  async requestWakeLock() {
    if ('wakeLock' in navigator && 'request' in (navigator as any).wakeLock) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        console.log('Wake lock activated - screen will stay awake');
        
        // Handle wake lock release
        this.wakeLock?.addEventListener('release', () => {
          console.log('Wake lock released');
        });
        
        return true;
      } catch (error) {
        console.warn('Wake lock request failed (this is normal on some mobile browsers):', error);
        return false;
      }
    }
    console.warn('Wake lock not supported on this device');
    return false;
  }

  async releaseWakeLock() {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
        console.log('Wake lock manually released');
      } catch (error) {
        console.warn('Wake lock release failed:', error);
      }
    }
  }

  isWakeLockActive(): boolean {
    return this.wakeLock !== null && !this.wakeLock.released;
  }

  async playBeep(volume: number = 0.5) {
    this.initializeAudio();
    if (!this.audioContext) {
      console.warn('Audio context not available for beep');
      return;
    }

    if (!this.userInteracted) {
      console.warn('Cannot play audio - no user interaction yet');
      return;
    }

    await this.resumeAudioContext();

    try {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
      console.log('Beep played successfully');
    } catch (error) {
      console.error('Error playing beep:', error);
    }
  }

  async playSiren(volume: number = 0.5) {
    this.initializeAudio();
    if (!this.audioContext) {
      console.warn('Audio context not available for siren');
      return;
    }

    if (!this.userInteracted) {
      console.warn('Cannot play audio - no user interaction yet');
      return;
    }

    await this.resumeAudioContext();

    try {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sawtooth';
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

    // Create siren effect
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + 0.5);
    oscillator.frequency.linearRampToValueAtTime(400, this.audioContext.currentTime + 1);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 1);
      console.log('Siren played successfully');
    } catch (error) {
      console.error('Error playing siren:', error);
    }
  }

  async playChime(volume: number = 0.5) {
    this.initializeAudio();
    if (!this.audioContext) {
      console.warn('Audio context not available for chime');
      return;
    }

    if (!this.userInteracted) {
      console.warn('Cannot play audio - no user interaction yet');
      return;
    }

    await this.resumeAudioContext();

    try {
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    for (let i = 0; i < frequencies.length; i++) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequencies[i], this.audioContext.currentTime);
      oscillator.type = 'sine';

      const startTime = this.audioContext.currentTime + (i * 0.2);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    }
      console.log('Chime played successfully');
    } catch (error) {
      console.error('Error playing chime:', error);
    }
  }

  async playHorn(volume: number = 0.5) {
    this.initializeAudio();
    if (!this.audioContext) {
      console.warn('Audio context not available for horn');
      return;
    }

    if (!this.userInteracted) {
      console.warn('Cannot play audio - no user interaction yet');
      return;
    }

    await this.resumeAudioContext();

    try {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.8);
      console.log('Horn played successfully');
    } catch (error) {
      console.error('Error playing horn:', error);
    }
  }

  async playAlert(alertSound: 'beep' | 'siren' | 'chime' | 'horn', volume: number = 0.5, enableVibration: boolean = true) {
    console.log(`Playing alert: ${alertSound}, volume: ${volume}, vibration: ${enableVibration}`);
    
    // Add vibration for mobile devices if enabled
    if (enableVibration) {
      const vibrationPattern = this.getVibrationPattern(alertSound);
      const vibrationSuccess = await this.vibrate(vibrationPattern);
      if (!vibrationSuccess) {
        console.warn('Vibration failed or not supported');
      }
    }
    
    // Play audio alert
    switch (alertSound) {
      case 'beep':
        await this.playBeep(volume);
        break;
      case 'siren':
        await this.playSiren(volume);
        break;
      case 'chime':
        await this.playChime(volume);
        break;
      case 'horn':
        await this.playHorn(volume);
        break;
    }
    
    console.log(`Alert completed: ${alertSound}`);
  }
}

export const audioService = new AudioService();