import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {EmergencyCall} from '../types/EmergencyCall';
import {Colors} from '../utils/Colors';
import {formatDistance, formatTime} from '../utils/DateUtils';

interface Props {
  route: {
    params: {
      calls: EmergencyCall[];
    };
  };
}

const EmergencyList: React.FC<Props> = ({route}) => {
  const [calls, setCalls] = useState<EmergencyCall[]>(route.params.calls || []);
  const [filteredCalls, setFilteredCalls] = useState<EmergencyCall[]>(calls);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCall, setSelectedCall] = useState<EmergencyCall | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'distance'>('time');

  useEffect(() => {
    filterAndSortCalls();
  }, [calls, searchQuery, sortBy]);

  const filterAndSortCalls = () => {
    let filtered = calls.filter(call =>
      call.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort calls
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'priority':
          const priorityOrder = {HIGH: 3, MEDIUM: 2, LOW: 1};
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        default:
          return 0;
      }
    });

    setFilteredCalls(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh - in real app, would fetch new data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return Colors.error;
      case 'MEDIUM':
        return Colors.warning;
      case 'LOW':
        return Colors.success;
      default:
        return Colors.textSecondary;
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

  const showCallDetails = (call: EmergencyCall) => {
    setSelectedCall(call);
    setModalVisible(true);
  };

  const renderEmergencyCall = ({item}: {item: EmergencyCall}) => (
    <TouchableOpacity
      style={[
        styles.callItem,
        {borderLeftColor: getPriorityColor(item.priority)}
      ]}
      onPress={() => showCallDetails(item)}
    >
      <View style={styles.callHeader}>
        <View style={styles.callTypeContainer}>
          <Icon
            name={getTypeIcon(item.type)}
            size={24}
            color={getPriorityColor(item.priority)}
          />
          <Text style={[styles.callType, {color: getPriorityColor(item.priority)}]}>
            {item.type}
          </Text>
        </View>
        <View style={styles.priorityBadge}>
          <Text style={[styles.priorityText, {color: getPriorityColor(item.priority)}]}>
            {item.priority}
          </Text>
        </View>
      </View>

      <Text style={styles.callDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.callDetails}>
        <View style={styles.detailRow}>
          <Icon name="location-on" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="access-time" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            {formatTime(new Date(item.timestamp))}
          </Text>
        </View>

        {item.distance && (
          <View style={styles.detailRow}>
            <Icon name="near-me" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>
              {formatDistance(item.distance)}
            </Text>
          </View>
        )}
      </View>

      {item.units && item.units.length > 0 && (
        <View style={styles.unitsContainer}>
          <Text style={styles.unitsLabel}>Units:</Text>
          <Text style={styles.unitsText}>
            {item.units.join(', ')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderCallDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedCall && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Emergency Call Details</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Type:</Text>
                  <Text style={[styles.modalValue, {color: getPriorityColor(selectedCall.priority)}]}>
                    {selectedCall.type}
                  </Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Priority:</Text>
                  <Text style={[styles.modalValue, {color: getPriorityColor(selectedCall.priority)}]}>
                    {selectedCall.priority}
                  </Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Time:</Text>
                  <Text style={styles.modalValue}>
                    {new Date(selectedCall.timestamp).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Address:</Text>
                  <Text style={styles.modalValue}>{selectedCall.address}</Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Description:</Text>
                  <Text style={styles.modalValue}>{selectedCall.description}</Text>
                </View>

                {selectedCall.units && selectedCall.units.length > 0 && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Responding Units:</Text>
                    <Text style={styles.modalValue}>
                      {selectedCall.units.join(', ')}
                    </Text>
                  </View>
                )}

                {selectedCall.distance && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Distance:</Text>
                    <Text style={styles.modalValue}>
                      {formatDistance(selectedCall.distance)}
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search calls..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            const nextSort = sortBy === 'time' ? 'priority' : sortBy === 'priority' ? 'distance' : 'time';
            setSortBy(nextSort);
          }}
        >
          <Icon name="sort" size={24} color={Colors.primary} />
          <Text style={styles.sortText}>
            {sortBy === 'time' ? 'Time' : sortBy === 'priority' ? 'Priority' : 'Distance'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredCalls}
        renderItem={renderEmergencyCall}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {renderCallDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  sortText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  listContainer: {
    padding: 15,
  },
  callItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  callTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  callDescription: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  callDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  unitsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    gap: 8,
  },
  unitsLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  unitsText: {
    fontSize: 12,
    color: Colors.text,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    gap: 15,
  },
  modalRow: {
    gap: 5,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalValue: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
});

export default EmergencyList;