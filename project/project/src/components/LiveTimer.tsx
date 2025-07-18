import React, { useState, useEffect } from 'react';
import { getWinnipegTime } from '../utils/timeUtils';

interface LiveTimerProps {
  startTime: string | Date;
  className?: string;
}

export const LiveTimer: React.FC<LiveTimerProps> = ({ startTime, className = '' }) => {
  const [elapsed, setElapsed] = useState<string>('0:00');

  useEffect(() => {
    const updateElapsed = () => {
      const currentWinnipegTime = getWinnipegTime();
      
      // Calculate elapsed time in h:m:s format
      let start: Date;
      if (typeof startTime === 'string') {
        const cleanTime = startTime.replace(/\.\d{3}$/, '');
        start = new Date(cleanTime);
      } else {
        start = startTime;
      }
      
      if (isNaN(start.getTime())) {
        setElapsed('0:00');
        return;
      }
      
      const diffMs = currentWinnipegTime.getTime() - start.getTime();
      
      if (diffMs < 0) {
        setElapsed('0:00');
        return;
      }
      
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      if (hours > 0) {
        setElapsed(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setElapsed(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    // Update immediately
    updateElapsed();

    // Update every second for real-time clock display
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <span className={className}>
      {elapsed}
    </span>
  );
};