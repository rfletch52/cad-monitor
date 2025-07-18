import React from 'react';
import { Incident } from '../types';
import { AlertTriangle, Clock, CheckCircle, Users } from 'lucide-react';

interface IncidentStatsProps {
  incidents: Incident[];
}

export const IncidentStats: React.FC<IncidentStatsProps> = ({ incidents }) => {
  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  
  const stats = {
    active: activeIncidents.length,
    critical: incidents.filter(i => i.priority === 'CRITICAL').length,
    resolved: incidents.filter(i => i.status === 'RESOLVED').length,
    totalUnits: new Set(activeIncidents.flatMap(i => i.units)).size
  };

  const statItems = [
    {
      label: 'Active Calls',
      value: stats.active,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900'
    },
    {
      label: 'Critical',
      value: stats.critical,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900'
    },
    {
      label: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      label: 'Units Deployed',
      value: stats.totalUnits,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Incident Statistics</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {statItems.map((item, index) => (
          <div key={index} className="text-center">
            <div className={`mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${item.bgColor} mb-2`}>
              <item.icon size={16} className={`${item.color} sm:w-5 sm:h-5`} />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};