import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import BackgroundJob from 'react-native-background-job';
import Sound from 'react-native-sound';

import EmergencyList from './components/EmergencyList';
import MapView from './components/MapView';
import SettingsScreen from './components/SettingsScreen';
import {CADService} from './services/CADService';
import {LocationService} from './services/LocationService';
import {NotificationService} from './services/NotificationService';
import {EmergencyCall} from './types/EmergencyCall';
import {useEmergencyData} from './hooks/useEmergencyData';
import {Colors} from './utils/Colors';

const Stack = createStackNavigator();

const HomeScreen = ({navigation}: any) => {
  const {
    emergencyCalls,
    loading,
    error,
    refreshData,
    lastUpdated,
  } = useEmergencyData();
  
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highPriorityOnly, setHighPriorityOnly] = useState(false);

  useEffect(() => {
    loadSettings();
    setupNotifications();
    
    if (monitoringEnabled) {
      startBackgroundMonitoring();
    }
    
    return () => {
      BackgroundJob.stop();
    };
  }, [monitoringEnabled]);

  const loadSettings = async () => {
    try {
      const monitoring = await AsyncStorage.getItem('monitoring_enabled');
      const sound = await AsyncStorage.getItem('sound_enabled');
      const priority = await AsyncStorage.getItem('high_priority_only');
      
      setMonitoringEnabled(monitoring === 'true');
      setSoundEnabled(sound !== 'false');
      setHighPriorityOnly(priority === 'true');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const setupNotifications = () => {
    PushNotification.configure({
      onNotification: function(notification) {
        console.log('Notification received:', notification);
        
        if (soundEnabled && notification.userInteraction) {
          playAlertSound();
        }
      },
      requestPermissions: true,
    });
  };

  const playAlertSound = () => {
    const sound = new Sound('emergency_alert.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load sound', error);
        return;
      }
      sound.play();
    });
  };

  const startBackgroundMonitoring = () => {
    BackgroundJob.start({
      jobKey: 'cadMonitoring',
      period: 30000, // Check every 30 seconds
    });

    BackgroundJob.register({
      jobKey: 'cadMonitoring',
      job: () => {
        CADService.fetchEmergencyCalls()
          .then((calls) => {
            const newHighPriorityCalls = calls.filter(call => 
              call.priority === 'HIGH' && 
              new Date(call.timestamp).getTime() > Date.now() - 60000 // Last minute
            );

            if (newHighPriorityCalls.length > 0) {
              NotificationService.sendEmergencyAlert(newHighPriorityCalls[0]);
              
              if (soundEnabled) {
                playAlertSound();
              }
            }
          })
          .catch(error => {
            console.error('Background monitoring error:', error);
          });
      },
    });
  };

  const toggleMonitoring = async (enabled: boolean) => {
    setMonitoringEnabled(enabled);
    await AsyncStorage.setItem('monitoring_enabled', enabled.toString());
    
    if (enabled) {
      startBackgroundMonitoring();
      Alert.alert(
        'Monitoring Started',
        'You will receive notifications for new emergency calls.',
        [{text: 'OK'}]
      );
    } else {
      BackgroundJob.stop();
      Alert.alert(
        'Monitoring Stopped',
        'You will no longer receive emergency notifications.',
        [{text: 'OK'}]
      );
    }
  };

  const filteredCalls = highPriorityOnly 
    ? emergencyCalls.filter(call => call.priority === 'HIGH')
    : emergencyCalls;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Winnipeg CAD Monitor</Text>
        <Text style={styles.headerSubtitle}>
          {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
        </Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Real-time Monitoring</Text>
          <Switch
            value={monitoringEnabled}
            onValueChange={toggleMonitoring}
            trackColor={{false: '#767577', true: Colors.accent}}
            thumbColor={monitoringEnabled ? Colors.primary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>High Priority Only</Text>
          <Switch
            value={highPriorityOnly}
            onValueChange={setHighPriorityOnly}
            trackColor={{false: '#767577', true: Colors.accent}}
            thumbColor={highPriorityOnly ? Colors.primary : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{filteredCalls.length}</Text>
          <Text style={styles.statLabel}>Active Calls</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {filteredCalls.filter(call => call.priority === 'HIGH').length}
          </Text>
          <Text style={styles.statLabel}>High Priority</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {filteredCalls.filter(call => call.type === 'FIRE').length}
          </Text>
          <Text style={styles.statLabel}>Fire Calls</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate('EmergencyList', {calls: filteredCalls})}
        >
          <Text style={styles.buttonText}>View All Calls</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('MapView', {calls: filteredCalls})}
        >
          <Text style={styles.buttonTextSecondary}>Map View</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={refreshData}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <Text style={styles.refreshButtonText}>Refresh Data</Text>
        )}
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {backgroundColor: Colors.primary},
          headerTintColor: '#fff',
          headerTitleStyle: {fontWeight: 'bold'},
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{title: 'CAD Monitor'}}
        />
        <Stack.Screen 
          name="EmergencyList" 
          component={EmergencyList}
          options={{title: 'Emergency Calls'}}
        />
        <Stack.Screen 
          name="MapView" 
          component={MapView}
          options={{title: 'Emergency Map'}}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{title: 'Settings'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  controls: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  controlLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 15,
  },
  statBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    margin: 15,
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    margin: 15,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  refreshButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    margin: 15,
    padding: 15,
    backgroundColor: Colors.error,
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default App;