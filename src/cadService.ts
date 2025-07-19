import { Incident, SystemStatus } from '../types';
import { winnipegCADService } from './winnipegCAD';

class CADService {
  private incidents: Incident[] = [];
  private incidentSubscribers: ((incidents: Incident[]) => void)[] = [];
  private statusSubscribers: ((status: SystemStatus) => void)[] = [];
  private newUnitSubscribers: ((incidentId: string, units: string[]) => void)[] = [];
  private systemStatus: SystemStatus = {
    scraper: 'ONLINE',
    database: 'ONLINE'
  };

  constructor() {
    this.startPolling();
  }

  private async startPolling() {
    await this.fetchNewIncidents();
    
    setInterval(async () => {
      await this.fetchNewIncidents();
    }, 30000); // Poll every 30 seconds
  }

  private async fetchNewIncidents() {
    try {
      console.log('📡 Fetching new incidents from Winnipeg CAD...');
      
      // Add timeout for mobile networks
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const newIncidents = await winnipegCADService.fetchNewIncidents();
      clearTimeout(timeoutId);
      
      if (newIncidents.length > 0) {
        console.log(`🆕 Found ${newIncidents.length} new incidents`);
        
        // Update existing incidents and add new ones
        const existingIncidentsMap = new Map(this.incidents.map(i => [i.id, i]));
        const updatedIncidents: Incident[] = [];
        const trulyNewIncidents: Incident[] = [];
        
        for (const newIncident of newIncidents) {
          const existingIncident = existingIncidentsMap.get(newIncident.id);
          
          if (existingIncident) {
            // Check for unit changes
            const existingUnits = new Set(existingIncident.units);
            const newUnits = new Set(newIncident.units);
            
            // Check for status changes (especially resolved status)
            const statusChanged = existingIncident.status !== newIncident.status;
            const wasResolved = existingIncident.status === 'RESOLVED';
            const nowResolved = newIncident.status === 'RESOLVED';
            
            // Find added units
            const addedUnits = [...newUnits].filter(unit => !existingUnits.has(unit));
            // Find removed units
            const removedUnits = [...existingUnits].filter(unit => !newUnits.has(unit));
            
            if (addedUnits.length > 0 || removedUnits.length > 0 || statusChanged) {
              const updatedHistory = [...(existingIncident.unitHistory || [])];
              const now = new Date().toISOString();
              
              // Add history entries for unit changes
              addedUnits.forEach(unit => {
                updatedHistory.push({
                  timestamp: now,
                  action: 'ADDED',
                  unit,
                  status: 'DISPATCHED',
                  notes: 'Unit added to incident'
                });
              });
              
              // Notify subscribers about new units for flashing
              if (addedUnits.length > 0) {
                this.notifyNewUnitSubscribers(newIncident.id, addedUnits);
              }
              
              removedUnits.forEach(unit => {
                updatedHistory.push({
                  timestamp: now,
                  action: 'REMOVED',
                  unit,
                  notes: 'Unit removed from incident'
                });
              });
              
              // Add status change entries
              if (statusChanged && !wasResolved && nowResolved) {
                updatedHistory.push({
                  timestamp: newIncident.closedTime || now,
                  action: 'STATUS_CHANGE',
                  unit: 'ALL_UNITS',
                  status: 'AVAILABLE',
                  notes: 'Incident resolved - all units available'
                });
              }
              
              // Update the incident
              const updatedIncident = {
                ...existingIncident,
                units: newIncident.units,
                unitHistory: updatedHistory,
                closedTime: newIncident.closedTime,
                // Update other fields that might have changed
                status: newIncident.status,
                priority: newIncident.priority,
                // Re-evaluate priority based on current unit count
                priority: this.evaluatePriorityByUnits(newIncident.type, newIncident.units.length, newIncident.priority)
              };
              
              updatedIncidents.push(updatedIncident);
              console.log(`🔄 Updated incident ${newIncident.id} - Added: ${addedUnits.join(', ')}, Removed: ${removedUnits.join(', ')}, Status: ${newIncident.status}`);
            } else {
              // No unit changes, keep existing incident
              updatedIncidents.push(existingIncident);
            }
          } else {
            // Truly new incident
            trulyNewIncidents.push(newIncident);
          }
        }
        
        if (trulyNewIncidents.length > 0) {
          // Combine updated existing incidents with new incidents
          const allIncidents = [...trulyNewIncidents, ...updatedIncidents];
          
          // Add incidents that weren't in the new data (keep existing ones)
          const newIncidentIds = new Set(newIncidents.map(i => i.id));
          const unchangedIncidents = this.incidents.filter(i => !newIncidentIds.has(i.id));
          
          this.incidents = [...allIncidents, ...unchangedIncidents];
          this.incidents = this.incidents.slice(0, 100); // Keep last 100
          this.notifyIncidentSubscribers();
        } else if (updatedIncidents.length > 0) {
          // Only updates, no new incidents
          const newIncidentIds = new Set(newIncidents.map(i => i.id));
          const unchangedIncidents = this.incidents.filter(i => !newIncidentIds.has(i.id));
          
          this.incidents = [...updatedIncidents, ...unchangedIncidents];
          this.notifyIncidentSubscribers();
        }
      }
      
      this.systemStatus.scraper = 'ONLINE';
      this.notifyStatusSubscribers();
      
    } catch (error) {
      console.error('❌ Error fetching incidents:', error);
      this.systemStatus.scraper = 'ERROR';
      this.notifyStatusSubscribers();
    }
  }

  async forceRefresh() {
    console.log('🔄 Force refreshing incident data...');
    await this.fetchNewIncidents();
  }

  subscribeToIncidents(callback: (incidents: Incident[]) => void) {
    this.incidentSubscribers.push(callback);
    callback(this.incidents);
  }

  subscribeToStatus(callback: (status: SystemStatus) => void) {
    this.statusSubscribers.push(callback);
    callback(this.systemStatus);
  }

  subscribeToNewUnits(callback: (incidentId: string, units: string[]) => void) {
    this.newUnitSubscribers.push(callback);
  }

  updateIncidentStatus(incidentId: string, status: Incident['status']) {
    const incident = this.incidents.find(i => i.id === incidentId);
    if (incident) {
      incident.status = status;
      this.notifyIncidentSubscribers();
    }
  }

  private notifyIncidentSubscribers() {
    this.incidentSubscribers.forEach(callback => callback(this.incidents));
  }

  private notifyStatusSubscribers() {
    this.statusSubscribers.forEach(callback => callback(this.systemStatus));
  }

  private notifyNewUnitSubscribers(incidentId: string, units: string[]) {
    this.newUnitSubscribers.forEach(callback => callback(incidentId, units));
  }

  private evaluatePriorityByUnits(type: string, unitCount: number, currentPriority: Incident['priority']): Incident['priority'] {
    const normalized = type.toLowerCase();
    const isAlarmCall = normalized.includes('alarm');
    
    // Set to CRITICAL based on unit count
    if (isAlarmCall && unitCount >= 6) {
      return 'CRITICAL';
    } else if (!isAlarmCall && unitCount >= 5) {
      return 'CRITICAL';
    }
    
    // Keep existing priority if unit count doesn't warrant CRITICAL
    return currentPriority;
  }

  // Add a simulated incident for testing
  addSimulatedIncident() {
    const simulatedIncident: Incident = {
      id: `SIM-${Date.now()}`,
      timestamp: new Date().toISOString(),
      neighborhood: 'Downtown',
      units: ['E1', 'L1', '15'],
      type: 'Structure Fire',
      priority: 'CRITICAL',
      status: 'DISPATCHED',
      address: '123 Main Street'
    };

    this.incidents = [simulatedIncident, ...this.incidents];
    this.notifyIncidentSubscribers();
  }
}

export const cadService = new CADService();