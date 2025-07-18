import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, {Marker, Callout, PROVIDER_GOOGLE} from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from 'react-native-geolocation-service';
import {EmergencyCall} from '../types/EmergencyCall';
import {LocationService} from '../services/LocationService';
import {Colors} from '../utils/Colors';

interface Props {
  route: {
    params: {
      calls: EmergencyCall[];
    };
  };
}

const EmergencyMapView: React.FC<Props> = ({route}) => {
  const [calls] = useState<EmergencyCall[]>(route.params.calls || []);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');

  // Winnipeg coordinates as default
  const winnipegCenter = {
    latitude: 49.8951,
    longitude: -97.1384,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const hasPermission = await LocationService.requestLocationPermission();
      
      if (hasPermission) {
        Geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setLoading(false);
          },
          (error) => {
            console.log('Location error:', error);
            setLoading(false);
            Alert.alert(
              'Location Error',
              'Could not get your current location. Showing Winnipeg area.',
              [{text: 'OK'}]
            );
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000}
        );
      } else {
        setLoading(false);
        Alert.alert(
          'Location Permission',
          'Location permission denied. Showing Winnipeg area.',
          [{text: 'OK'}]
        );
      }
    } catch (error) {
      console.error('Location permission error:', error);
      setLoading(false);
    }
  };

  const getMarkerColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return '#FF0000';
      case 'MEDIUM':
        return '#FFA500';
      case 'LOW':
        return '#00FF00';
      default:
        return '#808080';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FIRE':
        return 'local-fire-department';
      case 'MEDICAL':
        return 'local-hospital';
      case 'POLICE':
        return 'local-police';
      case 'ACCIDENT':
        return 'car-crash';
      default:
        return 'emergency';
    }
  };

  const toggleMapType = () => {
    const types: ('standard' | 'satellite' | 'hybrid')[] = ['standard', 'satellite', 'hybrid'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  const initialRegion = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : winnipegCenter;

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        mapType={mapType}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="blue"
          />
        )}

        {/* Emergency call markers */}
        {calls.map((call) => (
          <Marker
            key={call.id}
            coordinate={{
              latitude: call.coordinates.latitude,
              longitude: call.coordinates.longitude,
            }}
            pinColor={getMarkerColor(call.priority)}
          >
            <Callout style={styles.callout}>
              <View style={styles.calloutContainer}>
                <View style={styles.calloutHeader}>
                  <Icon
                    name={getTypeIcon(call.type)}
                    size={20}
                    color={getMarkerColor(call.priority)}
                  />
                  <Text style={[styles.calloutType, {color: getMarkerColor(call.priority)}]}>
                    {call.type}
                  </Text>
                  <Text style={[styles.calloutPriority, {color: getMarkerColor(call.priority)}]}>
                    {call.priority}
                  </Text>
                </View>
                
                <Text style={styles.calloutDescription} numberOfLines={2}>
                  {call.description}
                </Text>
                
                <Text style={styles.calloutAddress} numberOfLines={1}>
                  📍 {call.address}
                </Text>
                
                <Text style={styles.calloutTime}>
                  🕒 {new Date(call.timestamp).toLocaleTimeString()}
                </Text>

                {call.units && call.units.length > 0 && (
                  <Text style={styles.calloutUnits} numberOfLines={1}>
                    🚨 {call.units.join(', ')}
                  </Text>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Map controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleMapType}>
          <Icon name="layers" size={24} color={Colors.primary} />
          <Text style={styles.controlText}>
            {mapType.charAt(0).toUpperCase() + mapType.slice(1)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={getCurrentLocation}
        >
          <Icon name="my-location" size={24} color={Colors.primary} />
          <Text style={styles.controlText}>My Location</Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Priority Levels</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: '#FF0000'}]} />
          <Text style={styles.legendText}>High Priority</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: '#FFA500'}]} />
          <Text style={styles.legendText}>Medium Priority</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: '#00FF00'}]} />
          <Text style={styles.legendText}>Low Priority</Text>
        </View>
      </View>

      {/* Stats overlay */}
      <View style={styles.statsOverlay}>
        <Text style={styles.statsText}>
          {calls.length} Active Calls
        </Text>
        <Text style={styles.statsText}>
          {calls.filter(call => call.priority === 'HIGH').length} High Priority
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.text,
  },
  controls: {
    position: 'absolute',
    top: 10,
    right: 10,
    gap: 10,
  },
  controlButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  controlText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  legend: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 10,
    color: Colors.text,
  },
  statsOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
  },
  statsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  callout: {
    width: 250,
  },
  calloutContainer: {
    padding: 10,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  calloutType: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  calloutPriority: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  calloutDescription: {
    fontSize: 12,
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 16,
  },
  calloutAddress: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  calloutTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  calloutUnits: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});

export default EmergencyMapView;