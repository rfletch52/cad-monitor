import React from 'react';
import { SystemStatus as SystemStatusType } from '../types';
import { StatusIndicator } from './StatusIndicator';
import { Server, Database, ToggleRight } from 'lucide-react';

interface SystemStatusProps {
  status: SystemStatusType;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ status }) => {
  const statusItems = [
    { key: 'scraper', label: 'CAD Scraper', icon: Server },
    { key: 'database', label: 'Database', icon: Database }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">System Status</h3>
      
      {/* Data Source Info */}
      <div className="mb-3 sm:mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Public Data Source</span>
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <ToggleRight className="text-green-600" size={20} />
            <span className="text-green-600 dark:text-green-400 font-medium">data.winnipeg.ca</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
          Connected to Winnipeg's official public incident data feed
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {statusItems.map(item => (
          <StatusIndicator
            key={item.key}
            status={status[item.key as keyof SystemStatusType]}
            label={item.label}
            size="sm"
          />
        ))}
      </div>
    </div>
  );
};