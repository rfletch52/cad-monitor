// Get current time in Winnipeg timezone (Central Time)
export const getWinnipegTime = (): Date => {
  // Winnipeg is in Central Time (America/Winnipeg)
  const now = new Date();
  const winnipegTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Winnipeg"}));
  return winnipegTime;
};

export const formatTime = (timestamp: string | Date, use24Hour: boolean = false): string => {
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    if (isNaN(date.getTime())) {
      return 'Invalid time';
    }
    
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: !use24Hour
    };
    
    return date.toLocaleTimeString('en-US', options);
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
}

export const formatDateTime = (timestamp: string | Date, use24Hour: boolean = false): string => {
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: !use24Hour
    };
    
    const dateStr = date.toLocaleDateString('en-US', dateOptions);
    const timeStr = date.toLocaleTimeString('en-US', timeOptions);
    
    return `${dateStr} at ${timeStr}`;
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Invalid date';
  }
};

export const calculateTimeElapsed = (startTime: string | Date, endTime?: string | Date): string => {
  try {
    // Parse the start time properly - CAD data is in Winnipeg timezone
    let start: Date;
    if (typeof startTime === 'string') {
      const cleanTime = startTime.replace(/\.\d{3}$/, '');
      start = new Date(cleanTime);
    } else {
      start = startTime;
    }
    
    // Use provided end time or current Winnipeg time
    let end: Date;
    if (endTime) {
      if (typeof endTime === 'string') {
        const cleanEndTime = endTime.replace(/\.\d{3}$/, '');
        end = new Date(cleanEndTime);
      } else {
        end = endTime;
      }
    } else {
      // Use current Winnipeg time for ongoing incidents
      end = getWinnipegTime();
    }
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error('Invalid time in calculateTimeElapsed:', { startTime, endTime, start, end });
      return 'Invalid time';
    }
    
    const diffMs = end.getTime() - start.getTime();
    
    // Handle negative time differences (timezone issues)
    if (diffMs < 0) {
      // For negative differences, assume it's a very recent call
      return '<1m';
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    // Handle very small time differences (less than 1 minute)
    if (diffMinutes === 0) {
      const diffSeconds = Math.floor(diffMs / 1000);
      return diffSeconds < 30 ? '<1m' : '1m';
    }
    
    if (diffDays > 0) {
      const remainingHours = diffHours % 24;
      return remainingHours > 0 ? `${diffDays}d ${remainingHours}h` : `${diffDays}d`;
    } else if (diffHours > 0) {
      const remainingMinutes = diffMinutes % 60;
      return remainingMinutes > 0 ? `${diffHours}h ${remainingMinutes}m` : `${diffHours}h`;
    } else {
      return `${diffMinutes}m`;
    }
  } catch (error) {
    console.error('Error calculating time elapsed:', error);
    return 'Invalid time';
  }
}