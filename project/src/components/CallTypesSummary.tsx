import React from 'react';
import { Incident } from '../types';
import { BarChart3, AlertTriangle, Car, Flame, Heart, Shield } from 'lucide-react';

interface CallTypesSummaryProps {
  incidents: Incident[];
  showResolved: boolean;
  selectedCallType?: string;
  onCallTypeSelect: (callType: string | undefined) => void;
}

export const CallTypesSummary: React.FC<CallTypesSummaryProps> = ({ 
  incidents, 
  showResolved,
  selectedCallType, 
  onCallTypeSelect 
}) => {
  // Filter incidents based on showResolved toggle
  const filteredIncidents = incidents.filter(i => 
    showResolved ? i.status === 'RESOLVED' : i.status !== 'RESOLVED'
  );
  
  // Count incidents by type
  const callTypeCounts = filteredIncidents.reduce((acc, incident) => {
    const type = incident.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort by count (descending) then by name
  const sortedCallTypes = Object.entries(callTypeCounts)
    .sort(([a, countA], [b, countB]) => {
      if (countB !== countA) return countB - countA;
      return a.localeCompare(b);
    });

  // Get icon for call type
  const getCallTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('fire') || lowerType.includes('structure')) {
      return <Flame size={16} className="text-red-500" />;
    }
    if (lowerType.includes('medical') || lowerType.includes('cardiac') || lowerType.includes('heart')) {
      return <Heart size={16} className="text-pink-500" />;
    }
    if (lowerType.includes('motor vehicle') || lowerType.includes('vehicle') || lowerType.includes('mva') || lowerType.includes('mvc')) {
      return <Car size={16} className="text-blue-500" />;
    }
    if (lowerType.includes('alarm')) {
      return <Shield size={16} className="text-yellow-500" />;
    }
    
    return <AlertTriangle size={16} className="text-gray-500" />;
  };

  // Get priority color for the count badge
  const getPriorityColor = (type: string, count: number) => {
    const lowerType = type.toLowerCase();
    const isCriticalType = lowerType.includes('fire') || lowerType.includes('cardiac') || lowerType.includes('structure');
    
    if (isCriticalType || count >= 3) {
      return 'bg-red-500 text-white';
    }
    if (count >= 2) {
      return 'bg-orange-500 text-white';
    }
    return 'bg-blue-500 text-white';
  };

  if (filteredIncidents.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 size={20} className="text-blue-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Call Types Summary</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          {showResolved ? 'No resolved calls found' : 'No active calls at this time'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 size={20} className="text-blue-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Call Types Summary</h3>
        </div>
        <div className="flex items-center space-x-2">
          {selectedCallType && (
            <button
              onClick={() => onCallTypeSelect(undefined)}
              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Clear Filter
            </button>
          )}
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {filteredIncidents.length} {showResolved ? 'resolved' : 'active'} call{filteredIncidents.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {sortedCallTypes.map(([type, count]) => (
          <button
            key={type}
            onClick={() => onCallTypeSelect(selectedCallType === type ? undefined : type)}
            className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
              selectedCallType === type
                ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {getCallTypeIcon(type)}
              <span className={`text-sm truncate ${
                selectedCallType === type 
                  ? 'text-blue-900 dark:text-blue-100 font-medium' 
                  : 'text-gray-900 dark:text-white'
              }`} title={type}>
                {type}
              </span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(type, count)}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{sortedCallTypes.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Call Types</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{filteredIncidents.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total {showResolved ? 'Resolved' : 'Active'}</p>
          </div>
        </div>
        
        {selectedCallType && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
              Filtering by: <span className="font-medium">{selectedCallType}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};