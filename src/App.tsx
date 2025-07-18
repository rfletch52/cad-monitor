import React, { useState, useEffect } from 'react';
import './App.css';

interface CADEvent {
  id: string;
  timestamp: string;
  type: string;
  location: string;
  description: string;
  units: string[];
  priority: 'High' | 'Medium' | 'Low';
}

function App() {
  const [events, setEvents] = useState<CADEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock data for demonstration
  const mockEvents: CADEvent[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      type: 'Medical Emergency',
      location: 'Main St & Broadway',
      description: 'Chest pain complaint',
      units: ['A01', 'M15'],
      priority: 'High'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      type: 'Traffic Accident',
      location: 'Portage Ave & Memorial Blvd',
      description: 'Two vehicle collision, minor injuries',
      units: ['P12', 'A03', 'T07'],
      priority: 'Medium'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      type: 'Fire Alarm',
      location: '123 Elm Street',
      description: 'Smoke alarm activation',
      units: ['E05', 'L02'],
      priority: 'Medium'
    }
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // In a real app, this would fetch new data
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#ff4444';
      case 'Medium': return '#ffaa00';
      case 'Low': return '#44aa44';
      default: return '#666666';
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading CAD events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Winnipeg CAD Monitor</h1>
        <div className="status">
          <span className="status-indicator active"></span>
          <span>Live - Last updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </header>

      <main className="main">
        <div className="events-container">
          <h2>Active Events ({events.length})</h2>
          
          {events.length === 0 ? (
            <div className="no-events">
              <p>No active events at this time</p>
            </div>
          ) : (
            <div className="events-list">
              {events.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(event.priority) }}
                    >
                      {event.priority}
                    </span>
                    <span className="event-time">{formatTime(event.timestamp)}</span>
                  </div>
                  
                  <div className="event-content">
                    <h3 className="event-type">{event.type}</h3>
                    <p className="event-location">📍 {event.location}</p>
                    <p className="event-description">{event.description}</p>
                    
                    <div className="event-units">
                      <span className="units-label">Units:</span>
                      {event.units.map((unit) => (
                        <span key={unit} className="unit-badge">{unit}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;