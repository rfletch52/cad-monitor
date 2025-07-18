import React, { useState } from 'react';
import { Incident } from '../types';
import { IncidentCard } from './IncidentCard';
import { useSwipeGestures } from '../hooks/useSwipeGestures';
import { CheckCircle, X, Eye, Clock } from 'lucide-react';

interface SwipeableIncidentCardProps {
  incident: Incident;
  onStatusUpdate: (incidentId: string, status: Incident['status']) => void;
  onShowDetails: (incident: Incident) => void;
  use24HourClock?: boolean;
  isFlashing?: boolean;
  flashingUnits?: Set<string>;
  showTimersOnCards?: boolean;
}

export const SwipeableIncidentCard: React.FC<SwipeableIncidentCardProps> = (props) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { incident, onStatusUpdate, onShowDetails } = props;

  const handleSwipeLeft = () => {
    if (incident.status !== 'RESOLVED') {
      setShowActions(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handleSwipeRight = () => {
    setShowActions(false);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleResolve = () => {
    onStatusUpdate(incident.id, 'RESOLVED');
    setShowActions(false);
  };

  const handleViewDetails = () => {
    onShowDetails(incident);
    setShowActions(false);
  };

  const { swipeHandlers, isSwiping } = useSwipeGestures({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50,
    preventScroll: false
  });

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Action Buttons Background */}
      <div className={`absolute inset-0 flex items-center justify-end bg-gradient-to-l from-blue-500 to-green-500 transition-transform duration-300 ${
        showActions ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center space-x-4 pr-6">
          <button
            onClick={handleViewDetails}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          >
            <Eye size={16} />
            <span className="hidden sm:inline">Details</span>
          </button>
          {incident.status !== 'RESOLVED' && (
            <button
              onClick={handleResolve}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle size={16} />
              <span className="hidden sm:inline">Resolve</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div
        {...swipeHandlers}
        className={`relative z-10 transition-transform duration-300 ${
          isAnimating ? 'transition-transform' : ''
        } ${
          showActions ? '-translate-x-32' : 'translate-x-0'
        } ${
          isSwiping ? 'transition-none' : ''
        }`}
        style={{
          transform: isSwiping ? `translateX(${swipeOffset}px)` : undefined
        }}
      >
        <IncidentCard {...props} />
      </div>

      {/* Swipe Indicator */}
      {isSwiping && (
        <div className="absolute top-2 right-2 z-20 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          {incident.status !== 'RESOLVED' ? '← Swipe for actions' : '→ Swipe to dismiss'}
        </div>
      )}

      {/* Close Actions Button */}
      {showActions && (
        <button
          onClick={() => setShowActions(false)}
          className="absolute top-2 right-2 z-20 p-1 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};