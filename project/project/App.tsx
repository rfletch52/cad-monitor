import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import { Incident, SystemStatus as SystemStatusType, AlertSettings } from './src/types';
import { cadService } from './src/services/cadService';
import { nativeAudioService } from './src/services/nativeAudioService';
import { NativeAlertSettingsPanel } from './src/components/NativeAlertSettingsPanel';
import AsyncStorage from '@react-native-async-storage/async-storage';

function App(): JSX.Element {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatusType>({
    scraper: 'ONLINE',
    database: 'ONLINE'
  });
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    enabled: false,
    audioEnabled: true,
    vibrationEnabled: true,
    neighborhoods: [],
    eventTypes: [],
    priorities: ['CRITICAL', 'HIGH'],
    motorVehicleIncidents: true,
    volume: 1.0,
    alertSound: 'beep',
    unitAlertEnabled: true,
    unitAlertSound: 'chime'
  });

  // Load settings from storage
  useEffect(() => {
    loadSettings();
  }, []);

  // Initialize services
  useEffect(() => {
    initializeServices();
  }, []);

  // Subscribe to incidents
  useEffect(() => {
    cadService.subscribeToIncidents(setIncidents);
    cadService.subscribeToStatus(setSystemStatus);
  }, []);

  // Handle emergency alerts
  useEffect(() => {
    if (!alertSettings.enabled || incidents.length === 0) return;

    // Check for critical incidents
    const criticalIncidents = incidents.filter(incident => 
      incident.priority === 'CRITICAL' && 
      incident.status !== 'RESOLVED'
    );

    if (criticalIncidents.length > 0) {
      criticalIncidents.forEach(incident => {
        console.log(`🚨 CRITICAL INCIDENT: ${incident.type} in ${incident.neighborhood}`);
        nativeAudioService.playEmergencyAlert('critical');
      });
    }
  }, [incidents, alertSettings]);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('alertSettings');
      if (savedSettings) {
        setAlertSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (settings: AlertSettings) => {
    try {
      await AsyncStorage.setItem('alertSettings', JSON.stringify(settings));
      setAlertSettings(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const initializeServices = async () => {
    try {
      await nativeAudioService.initialize();
      console.log('✅ Native services initialized');
    } catch (error) {
      console.error('❌ Error initializing services:', error);
    }
  };

  const handleTestEmergencyAlert = async () => {
    try {
      await nativeAudioService.testEmergencyAlert();
    } catch (error) {
      Alert.alert('Test Failed', 'Emergency alert test failed. Please check permissions.');
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const criticalIncidents = incidents.filter(i => i.priority === 'CRITICAL');

  // Get unique neighborhoods and event types
  const availableNeighborhoods = [...new Set(incidents.map(i => i.neighborhood))].sort();
  const availableEventTypes = [...new Set(incidents.map(i => i.type))].sort();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Keep screen awake when alerts are enabled */}
      {alertSettings.enabled && <KeepAwake />}
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>🚨 Winnipeg CAD Monitor</Text>
          <Text style={styles.subtitle}>Live Emergency System</Text>
        </View>
        <TouchableOpacity
          style={[styles.alertButton, alertSettings.enabled && styles.alertButtonActive]}
          onPress={() => setShowAlertSettings(true)}
        >
          <Text style={styles.alertButtonText}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{activeIncidents.length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, styles.criticalNumber]}>{criticalIncidents.length}</Text>
          <Text style={styles.statLabel}>Critical</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{new Set(activeIncidents.flatMap(i => i.units)).size}</Text>
          <Text style={styles.statLabel}>Units</Text>
        </View>
      </View>

      {/* Emergency Test Button */}
      <TouchableOpacity style={styles.emergencyTestButton} onPress={handleTestEmergencyAlert}>
        <Text style={styles.emergencyTestButtonText}>
          🚨 TEST EMERGENCY ALERT (BYPASSES SILENT MODE)
        </Text>
      </TouchableOpacity>

      {/* Incidents List */}
      <ScrollView style={styles.incidentsList}>
        {activeIncidents.length === 0 ? (
          <View style={styles.noIncidents}>
            <Text style={styles.noIncidentsText}>No active incidents</Text>
            <Text style={styles.noIncidentsSubtext}>Monitoring Winnipeg CAD system...</Text>
          </View>
        ) : (
          activeIncidents.map(incident => (
            <View key={incident.id} style={[
              styles.incidentCard,
              incident.priority === 'CRITICAL' && styles.criticalIncident
            ]}>
              {/* Priority Banner */}
              {incident.priority === 'CRITICAL' && (
                <View style={styles.criticalBanner}>
                  <Text style={styles.criticalBannerText}>🚨 CRITICAL EMERGENCY</Text>
                </View>
              )}
              
              <View style={styles.incidentHeader}>
                <Text style={styles.incidentType}>{incident.type}</Text>
                <View style={styles.incidentBadges}>
                  <View style={[styles.priorityBadge, styles[`priority${incident.priority}`]]}>
                    <Text style={styles.badgeText}>{incident.priority}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.badgeText}>{incident.status}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.incidentDetails}>
                <Text style={styles.incidentLocation}>📍 {incident.neighborhood}</Text>
                <Text style={styles.incidentTime}>🕐 {new Date(incident.timestamp).toLocaleTimeString()}</Text>
                <Text style={styles.incidentUnits}>👥 {incident.units.length} units: {incident.units.join(', ')}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Alert Settings Modal */}
      {showAlertSettings && (
        <View style={styles.modalOverlay}>
          <NativeAlertSettingsPanel
            onClose={() => setShowAlertSettings(false)}
            alertSettings={alertSettings}
            onUpdateSettings={saveSettings}
            availableNeighborhoods={availableNeighborhoods}
            availableEventTypes={availableEventTypes}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  alertButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertButtonActive: {
    backgroundColor: '#ff4444',
  },
  alertButtonText: {
    fontSize: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    padding: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  criticalNumber: {
    color: '#ff4444',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emergencyTestButton: {
    backgroundColor: '#d32f2f',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  emergencyTestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  incidentsList: {
    flex: 1,
    padding: 16,
  },
  noIncidents: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noIncidentsText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  noIncidentsSubtext: {
    fontSize: 14,
    color: '#999',
  },
  incidentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  criticalIncident: {
    borderWidth: 2,
    borderColor: '#ff4444',
  },
  criticalBanner: {
    backgroundColor: '#ff4444',
    padding: 8,
  },
  criticalBannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  incidentHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  incidentType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  incidentBadges: {
    flexDirection: 'row',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#2196f3',
  },
  priorityCRITICAL: {
    backgroundColor: '#ff4444',
  },
  priorityHIGH: {
    backgroundColor: '#ff9800',
  },
  priorityMEDIUM: {
    backgroundColor: '#ffc107',
  },
  priorityLOW: {
    backgroundColor: '#4caf50',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  incidentDetails: {
    padding: 16,
    paddingTop: 8,
  },
  incidentLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  incidentTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  incidentUnits: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});