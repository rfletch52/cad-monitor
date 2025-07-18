import React from 'react';
import { Incident } from '../types';
import { Clock, MapPin, AlertTriangle, Building2, Radio, Wrench } from 'lucide-react';
import { calculateTimeElapsed } from '../utils/timeUtils';

interface UnitInfoBubbleProps {
  unit: string;
  unitType: string;
  model?: string;
  specs?: string;
  notes?: string;
  stationName: string;
  stationAddress: string;
  status: 'ASSIGNED' | 'AVAILABLE';
  incident?: Incident;
  deployedTime?: string;
  location?: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export const UnitInfoBubble: React.FC<UnitInfoBubbleProps> = ({
  unit,
  unitType,
  model,
  specs,
  notes,
  stationName,
  stationAddress,
  status,
  incident,
  deployedTime,
  location,
  position,
  onClose
}) => {
  // Calculate bubble position to stay within viewport
  const bubbleRef = React.useRef<HTMLDivElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = React.useState(position);

  React.useEffect(() => {
    if (bubbleRef.current) {
      const bubble = bubbleRef.current;
      const rect = bubble.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let newX = position.x;
      let newY = position.y;
      
      // Adjust horizontal position if bubble goes off screen
      if (position.x + rect.width > viewportWidth - 20) {
        newX = viewportWidth - rect.width - 20;
      }
      if (newX < 20) {
        newX = 20;
      }
      
      // Adjust vertical position if bubble goes off screen
      if (position.y + rect.height > viewportHeight - 20) {
        newY = position.y - rect.height - 10;
      }
      if (newY < 20) {
        newY = 20;
      }
      
      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [position]);

  // Handle backdrop clicks but ignore clicks inside the bubble
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  // Prevent bubble content clicks from closing
  const handleBubbleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  const getUnitTypeIcon = () => {
    switch (unitType.toLowerCase()) {
      case 'engine':
        return <Radio size={16} className="text-red-500" />;
      case 'ladder':
        return <Building2 size={16} className="text-orange-500" />;
      case 'rescue':
        return <Wrench size={16} className="text-purple-500" />;
      case 'paramedic':
        return <AlertTriangle size={16} className="text-blue-500" />;
      default:
        return <Radio size={16} className="text-gray-500" />;
    }
  };

  const getPriorityColor = () => {
    if (status === 'ASSIGNED' && incident) {
      switch (incident.priority) {
        case 'CRITICAL':
          return 'border-red-500 bg-red-50 dark:bg-red-900/95';
        case 'HIGH':
          return 'border-orange-500 bg-orange-50 dark:bg-orange-900/95';
        case 'MEDIUM':
          return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/95';
        default:
          return 'border-green-500 bg-green-50 dark:bg-green-900/95';
      }
    }
    return 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800';
  };

  return (
    <>
      {/* Backdrop to close bubble when clicking outside */}
      <div 
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
      />
      
      {/* Info Bubble */}
      <div
        ref={bubbleRef}
        className={`fixed z-50 w-80 max-w-[90vw] rounded-lg shadow-xl border-2 transition-all duration-200 ${getPriorityColor()}`}
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getUnitTypeIcon()}
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Unit {unit}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                status === 'ASSIGNED' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-green-500 text-white'
              }`}>
                {status}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Unit Details */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Unit Information</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-600 dark:text-gray-400">Type:</span>
                <span className="text-gray-900 dark:text-white">{unitType}</span>
              </div>
              {model && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Model:</span>
                  <span className="text-gray-900 dark:text-white text-xs">{model}</span>
                </div>
              )}
              {specs && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Specs:</span>
                  <span className="text-gray-900 dark:text-white text-xs">{specs}</span>
                </div>
              )}
              {notes && (
                <div className="flex items-start space-x-2">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Notes:</span>
                  <span className="text-gray-900 dark:text-white text-xs">{notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Station Information */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
              <Building2 size={14} />
              <span>Home Station</span>
            </h4>
            <div className="space-y-1 text-sm">
              <div className="text-gray-900 dark:text-white font-medium">{stationName}</div>
              <div className="text-gray-600 dark:text-gray-400 text-xs">{stationAddress}</div>
            </div>
          </div>

          {/* Current Assignment */}
          {status === 'ASSIGNED' && incident && (
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                <AlertTriangle size={14} className="text-red-500" />
                <span>Current Assignment</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-red-50 dark:bg-red-900/95 rounded border border-red-200 dark:border-red-800">
                  <div className="font-medium text-red-900 dark:text-red-200">{incident.type}</div>
                  <div className="flex items-center space-x-2 text-red-700 dark:text-red-300 text-xs mt-1">
                    <MapPin size={12} />
                    <span>{location}</span>
                  </div>
                  {deployedTime && (
                    <div className="flex items-center space-x-2 text-red-700 dark:text-red-300 text-xs mt-1">
                      <Clock size={12} />
                      <span>On call for {calculateTimeElapsed(deployedTime)}</span>
                    </div>
                  )}
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      incident.priority === 'CRITICAL' ? 'bg-red-600 text-white' :
                      incident.priority === 'HIGH' ? 'bg-orange-500 text-white' :
                      incident.priority === 'MEDIUM' ? 'bg-yellow-500 text-white' :
                      'bg-green-500 text-white'
                    }`}>
                      {incident.priority} PRIORITY
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Available Status */}
          {status === 'AVAILABLE' && (
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Available for dispatch</span>
              </div>
            </div>
          )}
        </div>

        {/* Arrow pointing to unit */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="w-4 h-4 bg-white dark:bg-gray-800 border-r-2 border-b-2 border-gray-300 dark:border-gray-600 transform rotate-45"></div>
        </div>
      </div>
    </>
  );
};