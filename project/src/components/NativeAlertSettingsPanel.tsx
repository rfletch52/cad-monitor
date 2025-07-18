import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { AlertSettings } from '../types';
import { nativeAudioService } from '../services/nativeAudioService';

interface NativeAlertSettingsPanelProps {
  onClose: () => void;
  alertSettings: AlertSettings;
  onUpdateSettings: (settings: AlertSettings) => void;
  availableNeighborhoods: string[];
  availableEventTypes: string[];
}

export const NativeAlertSettingsPanel: React.FC<NativeAlertSettingsPanelProps> = ({
  onClose,
  alertSettings,
  onUpdateSettings,
  availableNeighborhoods,
  availableEventTypes
}) => {
  const [settings, setSettings] = useState<AlertSettings>(alertSettings);

  const handleSave = () => {
    onUpdateSettings(settings);
    onClose();
  };

  const handleTestEmergencyAlert = async () => {
    try {
      await nativeAudioService.testEmergencyAlert();
    } catch (error) {
      Alert.alert('Test Failed', 'Emergency alert test failed. Please check permissions.');
    }
  };

  const toggleNeighborhood = (neighborhood: string) => {
    const newNeighborhoods = settings.neighborhoods.includes(neighborhood)
      ? settings.neighborhoods.filter(n => n !== neighborhood)
      : [...settings.neighborhoods, neighborhood];
    
    setSettings({ ...settings, neighborhoods: newNeighborhoods });
  };

  const toggleEventType = (eventType: string) => {
    const newEventTypes = settings.eventTypes.includes(eventType)
      ? settings.eventTypes.filter(t => t !== eventType)
      : [...settings.eventTypes, eventType];
    
    setSettings({ ...settings, eventTypes: newEventTypes });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🚨 Emergency Alert Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Master Toggle */}
        <View style={styles.section}>
          <View style={styles.masterToggle}>
            <View>
              <Text style={styles.sectionTitle}>Enable Emergency Alerts</Text>
              <Text style={styles.sectionSubtitle}>Master switch for all emergency notifications</Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={(value) => setSettings({ ...settings, enabled: value })}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.enabled ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>

        {settings.enabled && (
          <>
            {/* Emergency Audio Test */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔊 Emergency Audio System</Text>
              <Text style={styles.sectionSubtitle}>
                Native mobile app can play emergency alerts even when phone is on silent mode
              </Text>
              
              <TouchableOpacity 
                style={styles.emergencyTestButton}
                onPress={handleTestEmergencyAlert}
              >
                <Text style={styles.emergencyTestButtonText}>
                  🚨 TEST EMERGENCY ALERT (BYPASSES SILENT MODE)
                </Text>
              </TouchableOpacity>
              
              <View style={styles.audioSettings}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Audio Alerts</Text>
                  <Switch
                    value={settings.audioEnabled}
                    onValueChange={(value) => setSettings({ ...settings, audioEnabled: value })}
                  />
                </View>
                
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Vibration</Text>
                  <Switch
                    value={settings.vibrationEnabled}
                    onValueChange={(value) => setSettings({ ...settings, vibrationEnabled: value })}
                  />
                </View>
              </View>
            </View>

            {/* Priority Levels */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ Priority Levels</Text>
              {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(priority => (
                <TouchableOpacity
                  key={priority}
                  style={styles.checkboxRow}
                  onPress={() => {
                    const newPriorities = settings.priorities.includes(priority)
                      ? settings.priorities.filter(p => p !== priority)
                      : [...settings.priorities, priority];
                    setSettings({ ...settings, priorities: newPriorities });
                  }}
                >
                  <View style={[
                    styles.checkbox,
                    settings.priorities.includes(priority) && styles.checkboxChecked
                  ]}>
                    {settings.priorities.includes(priority) && (
                      <Text style={styles.checkboxCheck}>✓</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.checkboxLabel,
                    priority === 'CRITICAL' && styles.criticalText,
                    priority === 'HIGH' && styles.highText,
                    priority === 'MEDIUM' && styles.mediumText,
                    priority === 'LOW' && styles.lowText
                  ]}>
                    {priority}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Motor Vehicle Incidents */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚗 Special Incident Types</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Motor Vehicle Incidents</Text>
                <Switch
                  value={settings.motorVehicleIncidents}
                  onValueChange={(value) => setSettings({ ...settings, motorVehicleIncidents: value })}
                />
              </View>
            </View>

            {/* Neighborhoods */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                📍 Neighborhoods ({settings.neighborhoods.length} selected)
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setSettings({ ...settings, neighborhoods: [...availableNeighborhoods] })}
                >
                  <Text style={styles.selectButtonText}>Select All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSettings({ ...settings, neighborhoods: [] })}
                >
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.listContainer} nestedScrollEnabled>
                {availableNeighborhoods.map(neighborhood => (
                  <TouchableOpacity
                    key={neighborhood}
                    style={styles.checkboxRow}
                    onPress={() => toggleNeighborhood(neighborhood)}
                  >
                    <View style={[
                      styles.checkbox,
                      settings.neighborhoods.includes(neighborhood) && styles.checkboxChecked
                    ]}>
                      {settings.neighborhoods.includes(neighborhood) && (
                        <Text style={styles.checkboxCheck}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{neighborhood}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  masterToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
  },
  emergencyTestButton: {
    backgroundColor: '#d32f2f',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  emergencyTestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  audioSettings: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  criticalText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  highText: {
    color: '#f57c00',
    fontWeight: 'bold',
  },
  mediumText: {
    color: '#fbc02d',
    fontWeight: 'bold',
  },
  lowText: {
    color: '#388e3c',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  selectButton: {
    backgroundColor: '#2196f3',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
    flex: 1,
  },
  selectButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
  clearButton: {
    backgroundColor: '#666',
    padding: 8,
    borderRadius: 4,
    flex: 1,
  },
  clearButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
  listContainer: {
    maxHeight: 200,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#2196f3',
    padding: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});