import React from 'react';
import { Circle, AlertCircle } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'ONLINE' | 'OFFLINE' | 'ERROR';
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  label, 
  size = 'md' 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'ONLINE':
        return {
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900',
          icon: Circle,
          text: 'Online'
        };
      case 'OFFLINE':
        return {
          color: 'text-gray-500',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          icon: Circle,
          text: 'Offline'
        };
      case 'ERROR':
        return {
          color: 'text-red-500',
          bgColor: 'bg-red-100 dark:bg-red-900',
          icon: AlertCircle,
          text: 'Error'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${config.bgColor} ${sizeClasses[size]}`}>
      <Icon 
        size={iconSizes[size]} 
        className={`${config.color} ${status === 'ONLINE' ? 'animate-pulse' : ''}`}
        fill={status === 'ONLINE' ? 'currentColor' : 'none'}
      />
      <span className={`font-medium ${config.color}`}>{label}</span>
      <span className="text-gray-600 dark:text-gray-400 text-xs">({config.text})</span>
    </div>
  );
};