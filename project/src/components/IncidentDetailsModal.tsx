import React from 'react';
import { Incident, UnitHistoryEntry } from '../types';
import { 
  X, 
  Clock, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Radio,
  Activity,
  Plus,
  Minus,
  ArrowRight,
  Bell,
  Car,
  ExternalLink,
  Flame
} from 'lucide-react';
import { formatTime, formatDateTime } from '../utils/timeUtils';
import { calculateTimeElapsed } from '../utils/timeUtils';
import { LiveTimer } from './LiveTimer';

interface IncidentDetailsModalProps {
  incident: Incident;
  onClose: () => void;
  use24HourClock?: boolean;
  isFlashing?: boolean;
  flashingUnits?: Set<string>;
}

export const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({ 
  incident, 
  onClose,
  use24HourClock = false,
  isFlashing = false,
  flashingUnits = new Set()
}) => {

  const getPriorityColor = (priority: Incident['priority']) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-white';
      case 'LOW': return 'bg-green-500 text-white';
    }
  };

  const getStatusColor = (status: Incident['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-500 text-white';
      case 'DISPATCHED': return 'bg-blue-500 text-white';
      case 'EN_ROUTE': return 'bg-purple-500 text-white';
      case 'ON_SCENE': return 'bg-orange-500 text-white';
      case 'RESOLVED': return 'bg-green-500 text-white';
    }
  };

  const getActionIcon = (action: UnitHistoryEntry['action']) => {
    switch (action) {
      case 'ADDED': return <Plus size={14} className="text-green-600" />;
      case 'REMOVED': return <Minus size={14} className="text-red-600" />;
      case 'STATUS_CHANGE': return <ArrowRight size={14} className="text-blue-600" />;
    }
  };

  const getActionColor = (action: UnitHistoryEntry['action']) => {
    switch (action) {
      case 'ADDED': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'REMOVED': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'STATUS_CHANGE': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const isHighPriorityType = (type: string) => {
    const highPriorityTypes = [
      'structure fire', 'building fire', 'house fire', 'apartment fire',
      'cardiac arrest', 'heart attack', 'stroke', 'unconscious',
      'not breathing', 'difficulty breathing', 'chest pain',
      'motor vehicle accident', 'vehicle collision', 'mva', 'mvc',
      'explosion', 'hazmat', 'hazardous materials', 'gas leak'
    ];
    
    return highPriorityTypes.some(priorityType => 
      type.toLowerCase().includes(priorityType.toLowerCase())
    );
  };

  const isMotorVehicleIncident = incident.motor_vehicle_incident === "YES";
  const isWorkingFire = incident.type.toLowerCase().includes('structure fire') && 
                        incident.units.length >= 6 && 
                        incident.status !== 'RESOLVED';

  // Function to open Google Maps with neighborhood search
  const openGoogleMaps = () => {
    const searchQuery = `${incident.neighborhood}, Winnipeg, Manitoba, Canada`;
    const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
    window.open(googleMapsUrl, '_blank');
  };

  // Sort unit history by timestamp (newest first)
  const sortedUnitHistory = [...(incident.unitHistory || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Group unit history entries by timestamp
  const groupedUnitHistory = sortedUnitHistory.reduce((groups, entry) => {
    const timestamp = entry.timestamp;
    if (!groups[timestamp]) {
      groups[timestamp] = [];
    }
    groups[timestamp].push(entry);
    return groups;
  }, {} as Record<string, UnitHistoryEntry[]>);

  // Convert back to array format with grouped entries
  const groupedEntries = Object.entries(groupedUnitHistory).map(([timestamp, entries]) => ({
    timestamp,
    entries
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden transition-colors duration-200 ${
        isHighPriorityType(incident.type) || incident.priority === 'CRITICAL'
          ? 'ring-4 ring-red-300 dark:ring-red-700'
          : ''
      }`}>
        {/* High Priority Alert Banner */}
        {(isHighPriorityType(incident.type) || incident.priority === 'CRITICAL') && incident.status !== 'RESOLVED' && (
          <div className="bg-red-500 text-white px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium flex items-center space-x-2">
            <Bell size={16} />
            <span>🚨 HIGH PRIORITY EMERGENCY ALERT</span>
          </div>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 pr-2">
            <h2 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 dark:text-white truncate">{incident.type}</h2>
            <span className={`px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ${getPriorityColor(incident.priority)}`}>
              {incident.priority}
            </span>
            <span className={`px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 hidden sm:inline ${getStatusColor(incident.status)}`}>
              {incident.status.replace('_', ' ')}
            </span>
            {/* MVI Badge */}
            {isMotorVehicleIncident && (
              <span className="hidden sm:inline-flex items-center space-x-1 px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                <Car size={14} />
                <span className="hidden md:inline">MOTOR VEHICLE INCIDENT</span>
                <span className="md:hidden">MVI</span>
              </span>
            )}
            {/* Working Fire Badge */}
            {isWorkingFire && (
              <span className="hidden sm:inline-flex items-center space-x-1 px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full">
                <Flame size={14} />
                <span className="hidden md:inline">WORKING FIRE</span>
                <span className="md:hidden">FIRE</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] min-h-[60vh]">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Basic Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Time Information */}
                <div className="flex items-start space-x-3">
                  <Clock size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 sm:w-5 sm:h-5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Call Time</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {formatDateTime(incident.timestamp, use24HourClock)}
                    </p>
                    {incident.status !== 'RESOLVED' && (
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mt-1">
                        Elapsed: <LiveTimer startTime={incident.timestamp} />
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-3">
                  <MapPin size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 sm:w-5 sm:h-5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Location</p>
                    <button
                      onClick={openGoogleMaps}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline flex items-center space-x-1 transition-colors"
                      title="View on Google Maps"
                    >
                      <span>{incident.neighborhood}</span>
                      <ExternalLink size={12} />
                    </button>
                    {incident.incident_number && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Incident #{incident.incident_number}
                      </p>
                    )}
                  </div>
                </div>

                {/* Closed Time */}
                {incident.closedTime && (
                  <div className="flex items-start space-x-3">
                    <Clock size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 sm:w-5 sm:h-5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Closed Time</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formatDateTime(incident.closedTime, use24HourClock)}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                        Total Duration: {calculateTimeElapsed(incident.timestamp, incident.closedTime)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Motor Vehicle Incident Details */}
                {incident.motor_vehicle_incident && (
                  <div className="flex items-start space-x-3">
                    <Car size={16} className="text-blue-500 mt-0.5 sm:w-5 sm:h-5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Motor Vehicle Incident</p>
                      <div className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            incident.motor_vehicle_incident === 'YES' 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                          }`}>
                            {incident.motor_vehicle_incident === 'YES' ? '🚗 CONFIRMED MVI' : 'Not MVI'}
                          </span>
                        </div>
                        {incident.motor_vehicle_incident === 'YES' && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                            ⚠️ Traffic collision or vehicle-related emergency requiring immediate response
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Incident Information */}
                {(incident.district || incident.incident_type) && (
                  <div className="flex items-start space-x-3">
                    <AlertTriangle size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 sm:w-5 sm:h-5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Additional Details</p>
                      <div className="mt-1 space-y-1">
                        {incident.district && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">District:</span> {incident.district}
                          </p>
                        )}
                        {incident.incident_type && incident.incident_type !== incident.type && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Original Type:</span> {incident.incident_type}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Current Units Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-start space-x-3">
                <Users size={20} className="text-gray-400 dark:text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Responding Units ({incident.units.length})
                  </h3>
                  
                  {/* High Response Alert */}
                  {incident.units.length >= 5 && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        🚨 HIGH RESPONSE - {incident.units.length} Units Deployed
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Large emergency response indicates significant incident requiring multiple resources
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {incident.units.map(unit => (
                      <div 
                        key={unit} 
                        className={`px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 border ${
                          incident.units.length >= 5 
                            ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700' 
                            : 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700'
                        } ${
                          flashingUnits.has(unit) 
                            ? 'animate-pulse ring-2 ring-yellow-400 bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 border-yellow-400' 
                            : ''
                        }`}
                        title={flashingUnits.has(unit) ? 'Newly added unit' : ''}
                      >
                        <div className="text-center">
                          <span className="font-mono">{unit}</span>
                          {flashingUnits.has(unit) && <span className="ml-1">🆕</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Unit History */}
            {sortedUnitHistory.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8 pb-6">
                <div className="flex items-start space-x-3">
                  <Activity size={20} className="text-gray-400 dark:text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Unit Activity Timeline</h3>
                    <div className="space-y-4">
                      {groupedEntries.map((group, groupIndex) => (
                        <div key={groupIndex} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                              {formatTime(group.timestamp, use24HourClock)}
                            </span>
                          </div>
                          {/* Group entries by action type and notes */}
                          {(() => {
                            const actionGroups = group.entries.reduce((groups, entry) => {
                              const key = `${entry.action}-${entry.status || ''}-${entry.notes || ''}`;
                              if (!groups[key]) {
                                groups[key] = {
                                  action: entry.action,
                                  status: entry.status,
                                  notes: entry.notes,
                                  units: []
                                };
                              }
                              groups[key].units.push(entry.unit);
                              return groups;
                            }, {} as Record<string, { action: string; status?: string; notes?: string; units: string[] }>);

                            return Object.values(actionGroups).map((actionGroup, actionIndex) => (
                              <div key={actionIndex} className={`flex items-start space-x-3 p-4 rounded-lg border ${getActionColor(actionGroup.action as UnitHistoryEntry['action'])}`}>
                                <div className="flex-shrink-0 mt-0.5">
                                  {getActionIcon(actionGroup.action as UnitHistoryEntry['action'])}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {actionGroup.units.length === 1 ? (
                                      <>Unit {actionGroup.units[0]} {actionGroup.action.toLowerCase().replace('_', ' ')}</>
                                    ) : (
                                      <>Units {actionGroup.units.join(', ')} {actionGroup.action.toLowerCase().replace('_', ' ')}</>
                                    )}
                                    {actionGroup.status && ` - ${actionGroup.status}`}
                                  </p>
                                  {actionGroup.notes && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                      {actionGroup.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};