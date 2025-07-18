import React, { useState, useEffect } from 'react';
import { Incident, SystemStatus as SystemStatusType } from './types';
import { AlertSettings } from './types';
import { cadService } from './services/cadService';
import { audioService } from './services/audioService';
import { IncidentCard } from './components/IncidentCard';
import { SwipeableIncidentCard } from './components/SwipeableIncidentCard';
import { SwipeableModal } from './components/SwipeableModal';
import { IncidentStats } from './components/IncidentStats';
import { SystemStatus } from './components/SystemStatus';
import { SettingsPanel } from './components/SettingsPanel';
import { AlertSettingsPanel } from './components/AlertSettingsPanel';
import { IncidentDetailsModal } from './components/IncidentDetailsModal';
import { CallTypesSummary } from './components/CallTypesSummary';
import { UnitRoster } from './components/UnitRoster';
import { Shield, AlertTriangle, Zap, RefreshCw, Moon, Sun, Settings, Bell } from 'lucide-react';
import { formatTime } from './utils/timeUtils';

function App() {
  // Add mobile debugging
  useEffect(() => {
    console.log('App component mounted');
    console.log('User agent:', navigator.userAgent);
    console.log('Screen size:', window.screen.width, 'x', window.screen.height);
    console.log('Viewport size:', window.innerWidth, 'x', window.innerHeight);
  }, []);

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState<SystemStatusType>({
    scraper: 'ONLINE',
    database: 'ONLINE'
  });
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [showResolved, setShowResolved] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [use24HourClock, setUse24HourClock] = useState(() => {
    const saved = localStorage.getItem('use24HourClock');
    return saved ? JSON.parse(saved) : false;
  });
  const [showTimersOnCards, setShowTimersOnCards] = useState(() => {
    const saved = localStorage.getItem('showTimersOnCards');
    return saved ? JSON.parse(saved) : false;
  });
  const [sortBy, setSortBy] = useState<'time' | 'type' | 'priority'>('time');
  const [alertedIncidents, setAlertedIncidents] = useState<Set<string>>(new Set());
  const [flashingIncidents, setFlashingIncidents] = useState<Set<string>>(new Set());
  const [flashingUnits, setFlashingUnits] = useState<Map<string, Set<string>>>(new Map());
  const [alertedWorkingFires, setAlertedWorkingFires] = useState<Set<string>>(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedCallType, setSelectedCallType] = useState<string | undefined>(undefined);
  const [wakeLockEnabled, setWakeLockEnabled] = useState(false);
  const [isRosterExpanded, setIsRosterExpanded] = useState(false);
  const [isRosterCompact, setIsRosterCompact] = useState(false);
  const [selectedIncidentIndex, setSelectedIncidentIndex] = useState<number>(-1);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>(() => {
    const saved = localStorage.getItem('alertSettings');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      audioEnabled: false,
      vibrationEnabled: true,
      neighborhoods: [],
      eventTypes: [],
      priorities: ['CRITICAL', 'HIGH'],
      motorVehicleIncidents: true,
      volume: 0.7,
      alertSound: 'beep' as const,
      unitAlertEnabled: true,
      unitAlertSound: 'chime' as const
    };
  });

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Save 24-hour clock preference
  useEffect(() => {
    localStorage.setItem('use24HourClock', JSON.stringify(use24HourClock));
  }, [use24HourClock]);

  // Save timer display preference
  useEffect(() => {
    localStorage.setItem('showTimersOnCards', JSON.stringify(showTimersOnCards));
  }, [showTimersOnCards]);

  // Save alert settings
  useEffect(() => {
    localStorage.setItem('alertSettings', JSON.stringify(alertSettings));
    
    // Only clear alerted incidents when alert settings change after initial load
    if (!isInitialLoad) {
      setAlertedIncidents(new Set());
      setAlertedWorkingFires(new Set());
    }
    
    // Handle wake lock based on alert settings
    if (alertSettings.enabled && !wakeLockEnabled) {
      handleWakeLockRequest();
    } else if (!alertSettings.enabled && wakeLockEnabled) {
      handleWakeLockRelease();
    }
  }, [alertSettings]);

  // Wake lock management
  const handleWakeLockRequest = async () => {
    const success = await audioService.requestWakeLock();
    setWakeLockEnabled(success);
  };

  const handleWakeLockRelease = async () => {
    await audioService.releaseWakeLock();
    setWakeLockEnabled(false);
  };

  // Handle page visibility changes to re-request wake lock
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && alertSettings.enabled && !audioService.isWakeLockActive()) {
        await handleWakeLockRequest();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [alertSettings.enabled]);

  // Alert system for high-priority incident types
  useEffect(() => {
    if (!alertSettings.enabled || isInitialLoad) return;

    // Clear alerted incidents when alerts are disabled
    if (!alertSettings.enabled) {
      setAlertedIncidents(new Set());
      setAlertedWorkingFires(new Set());
      return;
    }

    const alertIncidentTypes = {
      // Fire incidents
      fire: [
        'structure fire', 'building fire', 'house fire', 'apartment fire',
        'commercial fire', 'industrial fire', 'fire rescue', 'working fire'
      ],
      // Medical emergencies
      medical: [
        'cardiac arrest', 'heart attack', 'stroke', 'unconscious',
        'not breathing', 'difficulty breathing', 'chest pain',
        'medical emergency', 'overdose', 'seizure', 'choking'
      ],
      // Motor vehicle incidents
      mvi: [
        'motor vehicle accident', 'vehicle collision', 'mva', 'mvc',
        'vehicle fire', 'rollover', 'pedestrian struck', 'hit and run'
      ],
      // Hazardous materials
      hazmat: [
        'explosion', 'hazmat', 'hazardous materials', 'gas leak',
        'chemical spill', 'propane leak', 'natural gas leak'
      ],
      // Violence/weapons
      violence: [
        'shooting', 'stabbing', 'assault', 'domestic violence',
        'weapon', 'gunshot', 'knife', 'violence'
      ],
      // Other emergencies
      emergency: [
        'rescue', 'water rescue', 'confined space', 'collapse',
        'entrapment', 'elevator rescue', 'high angle rescue'
      ]
    };

    const getAllAlertTypes = () => {
      return Object.values(alertIncidentTypes).flat();
    };

    incidents.forEach(incident => {
      if (incident.status !== 'RESOLVED' && !alertedIncidents.has(incident.id)) {
        // Skip if incident is older than 2 minutes to avoid alerting on old data
        const incidentTime = new Date(incident.timestamp).getTime();
        const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
        if (incidentTime < twoMinutesAgo) {
          // Mark as alerted without playing sound to prevent future alerts
          setAlertedIncidents(prev => new Set([...prev, incident.id]));
          return;
        }

        // Check if incident matches alert criteria
        const matchesNeighborhood = alertSettings.neighborhoods.length === 0 || 
          alertSettings.neighborhoods.includes(incident.neighborhood);
        
        const matchesEventType = alertSettings.eventTypes.length === 0 || 
          alertSettings.eventTypes.includes(incident.type);
        
        const matchesPriority = alertSettings.priorities.includes(incident.priority);
        
        const matchesMotorVehicle = !alertSettings.motorVehicleIncidents || 
          incident.motor_vehicle_incident !== 'YES';
        
        // If MVI setting is enabled, include MVI incidents regardless of other filters
        const isMVIMatch = alertSettings.motorVehicleIncidents && incident.motor_vehicle_incident === 'YES';
        
        if (!matchesNeighborhood || !matchesEventType || !matchesPriority) {
          // Mark as seen to prevent future checks
          setAlertedIncidents(prev => new Set([...prev, incident.id]));
          return;
        }

        const incidentType = incident.type.toLowerCase();
        const isAlertType = getAllAlertTypes().some(type => 
          incidentType.includes(type.toLowerCase())
        );

        const isCritical = incident.priority === 'CRITICAL';
        const isMotorVehicleIncident = incident.motor_vehicle_incident === 'YES' && alertSettings.motorVehicleIncidents;
        
        // Determine alert category
        let alertCategory = '';
        let alertIcon = '🚨';
        
        if (alertIncidentTypes.fire.some(type => incidentType.includes(type.toLowerCase()))) {
          alertCategory = 'FIRE';
          alertIcon = '🔥';
        } else if (alertIncidentTypes.medical.some(type => incidentType.includes(type.toLowerCase()))) {
          alertCategory = 'MEDICAL';
          alertIcon = '🚑';
        } else if (alertIncidentTypes.mvi.some(type => incidentType.includes(type.toLowerCase())) || isMotorVehicleIncident) {
          alertCategory = 'MVI';
          alertIcon = '🚗';
        } else if (alertIncidentTypes.hazmat.some(type => incidentType.includes(type.toLowerCase()))) {
          alertCategory = 'HAZMAT';
          alertIcon = '☢️';
        } else if (alertIncidentTypes.violence.some(type => incidentType.includes(type.toLowerCase()))) {
          alertCategory = 'VIOLENCE';
          alertIcon = '⚠️';
        } else if (alertIncidentTypes.emergency.some(type => incidentType.includes(type.toLowerCase()))) {
          alertCategory = 'RESCUE';
          alertIcon = '🆘';
        }
        
        if (isAlertType || isCritical || isMotorVehicleIncident) {
          console.log(`🚨 Triggering alert for incident ${incident.id}: ${incident.type} in ${incident.neighborhood}`);
          
          // Mark as alerted BEFORE playing sound to prevent race conditions
          setAlertedIncidents(prev => new Set([...prev, incident.id]));
          
          // Play audio alert if enabled
          if (alertSettings.audioEnabled) {
            audioService.playAlert(alertSettings.alertSound, alertSettings.volume, alertSettings.vibrationEnabled).catch(error => {
              console.error('Error playing audio alert:', error);
            });
          }

          // Show browser notification if supported
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            const title = alertCategory 
              ? `${alertIcon} ${alertCategory} Alert - ${incident.priority}`
              : `🚨 ${incident.priority} Alert`;
              
            try {
              new Notification(title, {
                body: `${incident.type}\n📍 ${incident.neighborhood}\n👥 ${incident.units.length} units responding`,
                icon: '/vite.svg',
                tag: incident.id,
                requireInteraction: isCritical || alertCategory === 'FIRE' || alertCategory === 'VIOLENCE'
              });
            } catch (error) {
              console.warn('Failed to create notification:', error);
            }
          }

          // Start flashing animation for critical incidents
          if (isCritical || alertCategory === 'FIRE' || alertCategory === 'VIOLENCE') {
            setFlashingIncidents(prev => new Set([...prev, incident.id]));
            
            // Stop flashing after 45 seconds
            setTimeout(() => {
              setFlashingIncidents(prev => {
                const newSet = new Set(prev);
                newSet.delete(incident.id);
                return newSet;
              });
            }, 45000); // 45 seconds
          }
        } else {
          // Mark as seen even if not alerting to prevent future checks
          setAlertedIncidents(prev => new Set([...prev, incident.id]));
        }
      }
    });

    // Check for working fire escalations (6+ units)
    incidents.forEach(incident => {
      if (incident.status !== 'RESOLVED' && 
          incident.units.length >= 6 && 
          !alertedWorkingFires.has(incident.id) &&
          alertSettings.enabled &&
          !isInitialLoad) {
        
        // Skip if incident is older than 2 minutes to avoid alerting on old data
        const incidentTime = new Date(incident.timestamp).getTime();
        const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
        if (incidentTime < twoMinutesAgo) {
          // Mark as alerted without playing sound to prevent future alerts
          setAlertedWorkingFires(prev => new Set([...prev, incident.id]));
          return;
        }
        
        console.log(`🔥 Working fire alert for incident ${incident.id}: ${incident.units.length} units responding`);
        
        // Mark as alerted for working fire
        setAlertedWorkingFires(prev => new Set([...prev, incident.id]));
        
        // Play audio alert if enabled
        if (alertSettings.audioEnabled) {
          audioService.playAlert('siren', alertSettings.volume, alertSettings.vibrationEnabled).catch(error => {
            console.error('Error playing working fire alert:', error);
          });
        }

        // Show browser notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('🔥 WORKING FIRE - Multiple Units', {
              body: `${incident.type}\n📍 ${incident.neighborhood}\n👥 ${incident.units.length} units responding`,
              icon: '/vite.svg',
              tag: `working-fire-${incident.id}`,
              requireInteraction: true
            });
          } catch (error) {
            console.warn('Failed to create working fire notification:', error);
          }
        }

        // Start flashing animation
        setFlashingIncidents(prev => new Set([...prev, incident.id]));
        
        // Stop flashing after 45 seconds
        setTimeout(() => {
          setFlashingIncidents(prev => {
            const newSet = new Set(prev);
            newSet.delete(incident.id);
            return newSet;
          });
        }, 45000);
      }
    });
  }, [incidents, alertSettings, isInitialLoad, alertedIncidents, alertedWorkingFires]);

  // Request notification permission on first load
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(error => {
        console.warn('Notification permission request failed:', error);
      });
    }
  }, []);
  
  useEffect(() => {
    cadService.subscribeToIncidents(setIncidents);
    cadService.subscribeToStatus(setSystemStatus);
    
    // Mark initial load as complete after first incident data arrives
    const unsubscribe = cadService.subscribeToIncidents((incidents) => {
      setIncidents(incidents);
      if (isInitialLoad && incidents.length > 0) {
        // Mark all existing incidents as already alerted to prevent alerts on page load
        const existingIncidentIds = new Set(incidents.map(i => i.id));
        const existingWorkingFires = new Set(
          incidents.filter(i => i.units.length >= 6).map(i => i.id)
        );
        
        setAlertedIncidents(existingIncidentIds);
        setAlertedWorkingFires(existingWorkingFires);
        setIsInitialLoad(false);
      }
    });
    
    // Subscribe to new unit notifications
    cadService.subscribeToNewUnits((incidentId: string, newUnits: string[]) => {
      console.log(`🚨 New units added to incident ${incidentId}:`, newUnits);
      
      // Play audio alert for new units if alerts are enabled
      if (alertSettings.enabled && alertSettings.audioEnabled && alertSettings.unitAlertEnabled) {
        audioService.playAlert(alertSettings.unitAlertSound, alertSettings.volume * 0.7, alertSettings.vibrationEnabled).catch(error => {
          console.error('Error playing new unit alert:', error);
        });
      }
      
      // Add units to flashing map
      setFlashingUnits(prev => {
        const newMap = new Map(prev);
        const existingUnits = newMap.get(incidentId) || new Set();
        const updatedUnits = new Set([...existingUnits, ...newUnits]);
        newMap.set(incidentId, updatedUnits);
        return newMap;
      });
      
      // Remove flashing after 45 seconds
      setTimeout(() => {
        setFlashingUnits(prev => {
          const newMap = new Map(prev);
          const existingUnits = newMap.get(incidentId) || new Set();
          newUnits.forEach(unit => existingUnits.delete(unit));
          
          if (existingUnits.size === 0) {
            newMap.delete(incidentId);
          } else {
            newMap.set(incidentId, existingUnits);
          }
          return newMap;
        });
      }, 45000); // 45 seconds
    });
    
    // Update clock every second - use local time
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(clockInterval);
  }, []);

  const handleStatusUpdate = (incidentId: string, status: Incident['status']) => {
    cadService.updateIncidentStatus(incidentId, status);
  };

  const handleShowDetails = (incident: Incident) => {
    const index = filteredIncidents.findIndex(i => i.id === incident.id);
    setSelectedIncidentIndex(index);
    setSelectedIncident(incident);
  };

  const handleNextIncident = () => {
    if (selectedIncidentIndex < filteredIncidents.length - 1) {
      const nextIndex = selectedIncidentIndex + 1;
      const nextIncident = filteredIncidents[nextIndex];
      setSelectedIncidentIndex(nextIndex);
      setSelectedIncident(nextIncident);
    }
  };

  const handlePreviousIncident = () => {
    if (selectedIncidentIndex > 0) {
      const prevIndex = selectedIncidentIndex - 1;
      const prevIncident = filteredIncidents[prevIndex];
      setSelectedIncidentIndex(prevIndex);
      setSelectedIncident(prevIncident);
    }
  };

  const handleCloseModal = () => {
    setSelectedIncident(null);
    setSelectedIncidentIndex(-1);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await cadService.forceRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    // First filter by call type if selected
    if (selectedCallType && incident.type !== selectedCallType) {
      return false;
    }
    
    // Filter by active/resolved toggle
    return showResolved ? incident.status === 'RESOLVED' : incident.status !== 'RESOLVED';
  }).sort((a, b) => {
    // For active incidents, pin CRITICAL incidents to the top
    if (!showResolved) {
      const aCritical = a.priority === 'CRITICAL' && a.status !== 'RESOLVED';
      const bCritical = b.priority === 'CRITICAL' && b.status !== 'RESOLVED';
      
      if (aCritical && !bCritical) return -1;
      if (!aCritical && bCritical) return 1;
    }
    
    // Then apply the selected sort method
    switch (sortBy) {
      case 'time':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'type':
        return a.type.localeCompare(b.type);
      case 'priority':
        const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  const isSystemHealthy = Object.values(systemStatus).every(status => status === 'ONLINE');

  // Get unique neighborhoods and event types for alert settings
  const availableNeighborhoods = [...new Set(incidents.map(i => i.neighborhood))].sort();
  
  // Official Winnipeg CAD incident types
  const allPossibleEventTypes = [
    // Medical
    'Medical Emergency',
    'Medical Response',
    
    // Fire Rescue
    'Fire Rescue – Fire',
    'Fire Rescue – Alarm', 
    'Fire Rescue – Rescue',
    'Fire Rescue – HazMat',
    'Fire Rescue – Other',
    'Fire Rescue – Structure Fire',
    'Fire Rescue – Outdoor',
    'Fire Rescue – Train / Rail Emergency',
    'Fire Rescue – Aircraft Emergency',
    
    // Motor Vehicle
    'Motor Vehicle Accident',
    'Motor Vehicle Accident',
    'Motor Vehicle Incident'
  ];
  
  // Combine seen incident types with official list, remove duplicates
  const seenEventTypes = [...new Set(incidents.map(i => i.type))];
  const availableEventTypes = [...new Set([...allPossibleEventTypes, ...seenEventTypes])].sort();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield size={24} className="text-red-600 flex-shrink-0" />
              <div>
                <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Winnipeg CAD Monitor</h1>
                <p className="text-xs text-gray-600 dark:text-gray-300 hidden sm:block">Live Emergency Dispatch System</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* Alert Settings */}
              <button
                onClick={() => setShowAlertSettings(!showAlertSettings)}
                className={`w-10 h-10 rounded-lg transition-colors duration-200 flex-shrink-0 flex items-center justify-center ${
                  alertSettings.enabled
                    ? 'bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title="Alert Settings"
              >
                <Bell size={18} className={`${
                  alertSettings.enabled 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-600 dark:text-gray-300'
                }`} />
              </button>
              
              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex-shrink-0 flex items-center justify-center"
                title="Settings"
              >
                <Settings size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex-shrink-0 flex items-center justify-center"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun size={18} className="text-yellow-500" />
                ) : (
                  <Moon size={18} className="text-gray-600 dark:text-gray-300" />
                )}
              </button>
              
              {/* System Status - Hidden on mobile */}
              <div className={`hidden md:flex items-center space-x-2 px-3 py-1 rounded-full flex-shrink-0 ${
                isSystemHealthy 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                <Zap size={16} />
                <span className="text-sm font-medium whitespace-nowrap">
                  {isSystemHealthy ? 'System Online' : 'System Issues'}
                </span>
              </div>
              
              {/* Time Display */}
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                {formatTime(currentTime, use24HourClock)}
              </div>
              
              {/* Wake Lock Status Indicator */}
              {alertSettings.enabled && (
                <div className={`hidden lg:flex items-center space-x-1 px-2 py-1 rounded-full text-xs flex-shrink-0 ${
                  wakeLockEnabled 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                }`}>
                  <span>{wakeLockEnabled ? '🔒' : '💤'}</span>
                  <span className="font-medium whitespace-nowrap">
                    {wakeLockEnabled ? 'Screen Locked' : 'Screen Sleep'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel 
          onClose={() => setShowSettings(false)}
          use24HourClock={use24HourClock}
          onToggle24Hour={setUse24HourClock}
          showTimersOnCards={showTimersOnCards}
          onToggleTimersOnCards={setShowTimersOnCards}
        />
      )}

      {/* Alert Settings Panel */}
      {showAlertSettings && (
        <AlertSettingsPanel
          onClose={() => setShowAlertSettings(false)}
          alertSettings={alertSettings}
          onUpdateSettings={setAlertSettings}
          availableNeighborhoods={availableNeighborhoods}
          availableEventTypes={availableEventTypes}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Unit Roster */}
            <UnitRoster 
              incidents={incidents} 
              isExpanded={isRosterExpanded}
              onToggleExpanded={() => setIsRosterExpanded(!isRosterExpanded)}
              isCompact={isRosterCompact}
              onToggleCompact={() => setIsRosterCompact(!isRosterCompact)}
            />
            
            {/* Statistics */}
            <IncidentStats incidents={incidents} />

            {/* Incident Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
              <div className="flex flex-col space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Incidents</h3>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4">
                  {/* Active/Resolved Toggle */}
                  <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setShowResolved(false)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        !showResolved
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setShowResolved(true)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        showResolved
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      Resolved
                    </button>
                  </div>
                  
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className={`flex items-center space-x-2 px-3 py-2 sm:py-1 rounded text-sm font-medium transition-colors w-full sm:w-auto justify-center sm:justify-start ${
                      isRefreshing
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                    title="Refresh incident data"
                  >
                    <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                  
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="time">Time (Newest First)</option>
                      <option value="type">Incident Type</option>
                      <option value="priority">Priority Level</option>
                    </select>
                  </div>
                </div>
                
                {/* Alert Status */}
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded hidden sm:block">
                  {typeof window !== 'undefined' && 'Notification' in window ? (
                    <>
                      🔔 Browser notifications enabled for critical incidents
                      {Notification.permission !== 'granted' && ' (Click to enable notifications)'}
                    </>
                  ) : (
                    '🔔 Audio alerts and vibration available for critical incidents'
                  )}
                </div>
              </div>
            </div>

            {/* Incidents List */}
            <div className="space-y-3 sm:space-y-4">
              {filteredIncidents.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-8 text-center transition-colors duration-200">
                  <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No incidents found</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {filter === 'ALL' 
                      ? 'Waiting for new incidents...' 
                      : `No ${showResolved ? 'resolved' : 'active'} incidents at this time.`
                    }
                  </p>
                </div>
              ) : (
                filteredIncidents.map(incident => (
                  <SwipeableIncidentCard
                    key={incident.id}
                    incident={incident}
                    onStatusUpdate={handleStatusUpdate}
                    onShowDetails={handleShowDetails}
                    use24HourClock={use24HourClock}
                    isFlashing={flashingIncidents.has(incident.id)}
                    flashingUnits={flashingUnits.get(incident.id) || new Set()}
                    showTimersOnCards={showTimersOnCards}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <SystemStatus status={systemStatus} />
            
            <CallTypesSummary 
              incidents={incidents} 
              showResolved={showResolved}
              selectedCallType={selectedCallType}
              onCallTypeSelect={setSelectedCallType}
            />
            
            {/* Data Source Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
              <div className="flex items-center space-x-2 mb-4">
                <Shield size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Source</h3>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">📡 Live CAD Data</h4>
                  <p className="text-blue-800 dark:text-blue-300 text-xs">
                    Real-time incident data from Winnipeg's official dispatch system
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">🔄 Auto-Refresh</h4>
                  <p className="text-green-800 dark:text-green-300 text-xs">
                    Updates every 30 seconds with latest incident information
                  </p>
                </div>
                
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2">📊 Unit Tracking</h4>
                  <p className="text-purple-800 dark:text-purple-300 text-xs">
                    Monitors unit assignments and status changes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Details Modal */}
      {selectedIncident && (
        <SwipeableModal
          isOpen={!!selectedIncident}
          onClose={handleCloseModal}
          onNext={selectedIncidentIndex < filteredIncidents.length - 1 ? handleNextIncident : undefined}
          onPrevious={selectedIncidentIndex > 0 ? handlePreviousIncident : undefined}
          showNavigation={true}
        >
          <IncidentDetailsModal
            incident={selectedIncident}
            onClose={handleCloseModal}
            use24HourClock={use24HourClock}
            isFlashing={flashingIncidents.has(selectedIncident.id)}
            flashingUnits={flashingUnits.get(selectedIncident.id) || new Set()}
          />
        </SwipeableModal>
      )}
    </div>
  );
}

export default App;