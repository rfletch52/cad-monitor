import React from 'react';
import { Incident } from '../types';
import { 
  Clock, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Radio,
  Bell,
  Car,
  Flame
} from 'lucide-react';
import { formatTime } from '../utils/timeUtils';
import { calculateTimeElapsed } from '../utils/timeUtils';
import { LiveTimer } from './LiveTimer';

interface IncidentCardProps {
  incident: Incident;
  onStatusUpdate: (incidentId: string, status: Incident['status']) => void;
  onShowDetails: (incident: Incident) => void;
  use24HourClock?: boolean;
  isFlashing?: boolean;
  flashingUnits?: Set<string>;
  showTimersOnCards?: boolean;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ 
  incident, 
  onStatusUpdate,
  onShowDetails,
  use24HourClock = false,
  isFlashing = false,
  flashingUnits = new Set(),
  showTimersOnCards = false
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
  
  const formatTimeHelper = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }
      
      const options: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: !use24HourClock
      };
      
      return date.toLocaleTimeString('en-US', options);
    } catch (error) {
      return 'Invalid time';
    }
  };

  return (
    <div 
      className={`${
        'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      } rounded-lg shadow-md border overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer touch-manipulation ${
        isHighPriorityType(incident.type) || incident.priority === 'CRITICAL'
          ? `border-red-300 dark:border-red-700 ring-2 ring-red-200 dark:ring-red-800 ${
              isFlashing && incident.priority === 'CRITICAL' ? 'animate-pulse' : ''
            }`
          : ''
      }`}
      onClick={() => onShowDetails(incident)}
      style={
        isFlashing && incident.priority === 'CRITICAL'
          ? {
              animation: 'flash-red 1s infinite',
              '--flash-color': '#ef4444'
            } as React.CSSProperties
          : undefined
      }
    >
      {/* High Priority Alert Banner */}
      {(isHighPriorityType(incident.type) || incident.priority === 'CRITICAL') && incident.status !== 'RESOLVED' && (
        <div className="bg-red-500 text-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium flex items-center space-x-2">
          <Bell size={16} className="animate-pulse" />
          <span>HIGH PRIORITY ALERT</span>
        </div>
      )}
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{incident.type}</h3>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium hidden sm:inline ${getPriorityColor(incident.priority)}`}>
              {incident.priority}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium hidden sm:inline ${getStatusColor(incident.status)}`}>
              {incident.status.replace('_', ' ')}
            </span>
            {/* MVI Badge - Desktop */}
            {isMotorVehicleIncident && (
              <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                <Car size={12} />
                <span>MVI</span>
              </span>
            )}
            {/* Working Fire Badge - Desktop */}
            {isWorkingFire && (
              <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-full">
                <Flame size={12} />
                <span>WORKING FIRE</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
            <span>{formatTime(incident.timestamp, use24HourClock)}</span>
            {showTimersOnCards && (
              incident.status === 'RESOLVED' && incident.closedTime ? (
                <span className="text-green-600 dark:text-green-400 font-medium">
                  ({calculateTimeElapsed(incident.timestamp, incident.closedTime)} duration)
                </span>
              ) : (
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  (<LiveTimer startTime={incident.timestamp} /> elapsed)
                </span>
              )
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowDetails(incident);
              }}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs hidden sm:inline"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-2 sm:space-y-3">
          {/* Mobile Priority/Status */}
          <div className="flex items-center space-x-2 sm:hidden">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(incident.priority)}`}>
              {incident.priority}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(incident.status)}`}>
              {incident.status.replace('_', ' ')}
            </span>
            {/* MVI Badge - Mobile */}
            {isMotorVehicleIncident && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                <Car size={12} />
                <span>MVI</span>
              </span>
            )}
            {/* Working Fire Badge - Mobile */}
            {isWorkingFire && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-full">
                <Flame size={12} />
                <span>WORKING FIRE</span>
              </span>
            )}
          </div>

          {/* Address and Location */}
          <div className="flex items-start space-x-3">
            <MapPin size={14} className="text-gray-400 dark:text-gray-500 mt-0.5 sm:w-4 sm:h-4" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{incident.neighborhood}</p>
              {incident.incident_number && (
                <p className="text-xs text-gray-500 dark:text-gray-400">#{incident.incident_number}</p>
              )}
            </div>
          </div>

          {/* Units */}
          <div className="flex items-center space-x-3">
            <Users size={14} className="text-gray-400 dark:text-gray-500 sm:w-4 sm:h-4" />
            <div className="flex flex-wrap gap-1">
              {incident.units.map(unit => (
                <span 
                  key={unit} 
                  className={`px-2 py-1 text-xs rounded font-medium transition-all duration-200 ${
                    incident.units.length >= 5 
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' 
                      : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  } ${
                    flashingUnits.has(unit) 
                      ? 'animate-pulse ring-2 ring-yellow-400 bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100' 
                      : ''
                  }`}
                  title={flashingUnits.has(unit) ? 'Newly added unit' : ''}
                >
                  {unit}
                </span>
              ))}
              {incident.units.length >= 5 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded font-bold">
                  {incident.units.length} UNITS
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};