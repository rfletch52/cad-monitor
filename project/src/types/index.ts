export interface Incident {
  id: string;
  timestamp: string;
  neighborhood: string;
  units: string[];
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'RESOLVED';
  address?: string;
  unitHistory?: UnitHistoryEntry[];
  closedTime?: string;
  // Raw Winnipeg CAD fields
  incident_number?: string;
  call_time?: string;
  incident_type?: string;
  location?: string;
  district?: string;
  responding_units?: string;
  closed_time?: string;
  motor_vehicle_incident?: string;
}

export interface UnitHistoryEntry {
  timestamp: string;
  action: 'ADDED' | 'REMOVED' | 'STATUS_CHANGE';
  unit: string;
  status?: 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'AVAILABLE';
  notes?: string;
}

export interface WinnipegCADResponse {
  incident_number: string;
  call_time: string;
  incident_type: string;
  closed_time?: string;
  motor_vehicle_incident?: string;
  units: string;
  neighbourhood: string;
  ward: string;
}

export interface SystemStatus {
  scraper: 'ONLINE' | 'OFFLINE' | 'ERROR';
  database: 'ONLINE' | 'OFFLINE' | 'ERROR';
}
export interface AlertSettings {
  enabled: boolean;
  audioEnabled: boolean;
  vibrationEnabled: boolean;
  neighborhoods: string[];
  eventTypes: string[];
  priorities: ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[];
  motorVehicleIncidents: boolean;
  volume: number;
  alertSound: 'beep' | 'siren' | 'chime' | 'horn';
  unitAlertEnabled: boolean;
  unitAlertSound: 'beep' | 'siren' | 'chime' | 'horn';
}