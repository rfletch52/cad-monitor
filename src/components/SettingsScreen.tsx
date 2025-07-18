import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../utils/Colors';

const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState({
    monitoringEnabled: false,
    soundEnabled: true,
    vibrationEnabled: true,
    highPriorityOnly: false,
    refreshInterval: 30,
    maxDistance: 50,
    notificationTypes: {
      fire: true,
      medical: true,
      police: true,
      accident: true,
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings({...settings, ...JSON.parse(savedSettings)});
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const updateSetting = (key: string, value: any) => {
    const newSettings = {...settings, [key]: value};
    saveSettings(newSettings);
  };

  const updateNotificationType = (type: string, enabled: boolean) => {
    const newSettings = {
      ...settings,
      notificationTypes: {
        ...settings.notificationTypes,
        [type]: enabled,
      },
    };
    saveSettings(newSettings);
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultSettings = {
              monitoringEnabled: false,
              soundEnabled: true,
              vibrationEnabled: true,
              highPriorityOnly: false,
              refreshInterval: 30,
              maxDistance: 50,
              notificationTypes: {
                fire: true,
                medical: true,
                police: true,
                accident: true,
              },
            };
            saveSettings(defaultSettings);
          },
        },
      ]
    );
  };

  const clearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached emergency data. Continue?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('cached_emergency_calls');
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monitoring</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Real-time Monitoring</Text>
            <Text style={styles.settingDescription}>
              Receive notifications for new emergency calls
            </Text>
          </View>
          <Switch
            value={settings.monitoringEnabled}
            onValueChange={(value) => updateSetting('monitoringEnabled', value)}
            trackColor={{false: '#767577', true: Colors.accent}}
            thumbColor={settings.monitoringEnabled ? Colors.primary : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>High Priority Only</Text>
            <Text style={styles.settingDescription}>
              Only show high priority emergency calls
            </Text>
          </View>
          <Switch
            value={settings.highPriorityOnly}
            onValueChange={(value) => updateSetting('highPriorityOnly', value)}
            trackColor={{false: '#767577', true: Colors.accent}}
            thumbColor={settings.highPriorityOnly ? Colors.primary : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Refresh Interval (seconds)</Text>
            <Text style={styles.settingDescription}>
              How often to check for new calls
            </Text>
          </View>
          <TextInput
            style={styles.numberInput}
            value={settings.refreshInterval.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 30;
              updateSetting('refreshInterval', Math.max(10, Math.min(300, value)));
            }}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Max Distance (km)</Text>
            <Text style={styles.settingDescription}>
              Maximum distance for emergency calls
            </Text>
          </View>
          <TextInput
            style={styles.numberInput}
            value={settings.maxDistance.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 50;
              updateSetting('maxDistance', Math.max(1, Math.min(200, value)));
            }}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Sound Alerts</Text>
            <Text style={styles.settingDescription}>
              Play sound for emergency notifications
            </Text>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => updateSetting('soundEnabled', value)}
            trackColor={{false: '#767577', true: Colors.accent}}
            thumbColor={settings.soundEnabled ? Colors.primary : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Vibration</Text>
            <Text style={styles.settingDescription}>
              Vibrate for emergency notifications
            </Text>
          </View>
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={(value) => updateSetting('vibrationEnabled', value)}
            trackColor={{false: '#767577', true: Colors.accent}}
            thumbColor={settings.vibrationEnabled ? Colors.primary : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Types</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="local-fire-department" size={24} color={Colors.error} />
            <Text style={styles.settingLabel}>Fire Emergencies</Text>
          </View>
          <Switch
            value={settings.notificationTypes.fire}
            onValueChange={(value) => updateNotificationType('fire', value)}
            trackColor={{false: '#767577', true: Colors.accent}}
            thumbColor={settings.notificationTypes.fire ? Colors.primary : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="local-hospital" size={24} color={Colors.warning} />
            <Text style={styles.settingLabel}>Medical Emergencies</Text>
          </View>
          <Switch
            value={settings.notificationTypes.medical}
            onValueChange={(value) => updateNotificationType('medical', value)}
            trackColor={{false: '#767577', true: Colors.accent}}
            thumbColor={settings.notificationTypes.medical ? Colors.primary : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="local-police" size={24} color={Colors.primary} />
            <Text style={styles.settingLabel}>Police Emergencies</Text>
          </View>
          <Switch
            value={settings.notificationTypes.police}
            onValueChange={(value) => updateNotificationType('police', value)}
            trackColor={{false: '#767577', true: Colors.accent}}
            thumbColor={settings.notificationTypes.police ? Colors.primary : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="car-crash" size={24} color={Colors.textSecondary} />
            <Text style={styles.settingLabel}>Traffic Accidents</Text>
          </View>
          <Switch
            value={settings.notificationTypes.accident}
            onValueChange={(value) => updateNotificationType('accident', value)}
            trackColor={{false: '#767577', true: Colors.accent}}
            thumbColor={settings.notificationTypes.accident ? Colors.primary : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={clearCache}>
          <Icon name="clear-all" size={24} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Clear Cache</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={resetSettings}>
          <Icon name="restore" size={24} color={Colors.error} />
          <Text style={[styles.actionButtonText, {color: Colors.error}]}>
            Reset Settings
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          Winnipeg CAD Monitor v1.0.0{'\n'}
          Real-time emergency services monitoring for Winnipeg, Manitoba.{'\n\n'}
          This app provides real-time information about emergency calls in the Winnipeg area.
          Data is sourced from publicly available emergency services communications.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    padding: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: Colors.background,
    marginBottom: 10,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
  },
  aboutText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default SettingsScreen;