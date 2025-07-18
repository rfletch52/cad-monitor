import { WinnipegCADResponse, Incident } from '../types';

const WINNIPEG_CAD_API = 'https://data.winnipeg.ca/resource/yg42-q284.json';

class WinnipegCADService {
  private lastTimestamp: string;
  private seenIncidents: Set<string> = new Set();

  constructor() {
    // Start from 2 hours ago to catch recent incidents
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    this.lastTimestamp = twoHoursAgo.toISOString();
  }

  async fetchNewIncidents(): Promise<Incident[]> {
    try {
      // Get recent incidents from Winnipeg CAD API
      const queryUrl = `${WINNIPEG_CAD_API}?$order=call_time%20DESC&$limit=1000`;
      
      console.log('Fetching from Winnipeg CAD API:', queryUrl);
      
      // Add timeout and better error handling for mobile
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(queryUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('API Response not OK:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: WinnipegCADResponse[] = await response.json();
      
      console.log(`Received ${data.length} incidents from Winnipeg CAD API`);
      
      if (data.length === 0) {
        console.warn('No incidents received from API');
        return [];
      }
      
      // For initial load, don't filter by seen incidents to get all available data
      // Only filter for subsequent updates
      const isInitialLoad = this.seenIncidents.size === 0;
      const newIncidents = isInitialLoad ? data : data.filter(incident => !this.seenIncidents.has(incident.incident_number));
      
      // Mark incidents as seen
      data.forEach(incident => 
        this.seenIncidents.add(incident.incident_number)
      );
      
      // Update timestamp for next query
      if (data.length > 0) {
        this.lastTimestamp = data[0].call_time;
      }
      
      // Convert to our internal format
      const convertedIncidents = newIncidents.map(incident => this.convertToIncident(incident));
      console.log(`Found ${convertedIncidents.length} ${isInitialLoad ? 'total' : 'new'} incidents`);
      
      return convertedIncidents;
      
    } catch (error) {
      console.error('Error fetching Winnipeg CAD data:', error);
      return [];
    }
  }

  private convertToIncident = (cadData: WinnipegCADResponse): Incident => {
    const normalizedTimestamp = cadData.call_time || new Date().toISOString();
    const rawType = cadData.incident_type || 'Unknown';
    const normalizedType = this.normalizeIncidentType(rawType);
    const parsedUnits = this.parseUnits(cadData.units);
    const basePriority = this.determinePriority(rawType);
    
    // Check if this is a motor vehicle incident and adjust type accordingly
    const finalType = cadData.motor_vehicle_incident 
      ? (cadData.motor_vehicle_incident === "YES" ? `Motor Vehicle Incident - ${normalizedType}` : normalizedType)
      : normalizedType;
    
    const priority = this.evaluatePriorityByUnits(rawType, parsedUnits.length, basePriority);
    
    // Determine status based on closed_time
    const status: Incident['status'] = cadData.closed_time ? 'RESOLVED' : 'DISPATCHED';
    
    // Create unit history for initial dispatch
    const unitHistory = parsedUnits.map(unit => ({
      timestamp: normalizedTimestamp,
      action: 'ADDED' as const,
      unit,
      status: 'DISPATCHED' as const,
      notes: 'Initial dispatch'
    }));
    
    // Add resolution entry if call is closed
    if (cadData.closed_time) {
      unitHistory.push({
        timestamp: cadData.closed_time,
        action: 'STATUS_CHANGE' as const,
        unit: 'ALL_UNITS',
        status: 'AVAILABLE' as const,
        notes: 'Incident resolved - all units available'
      });
    }
    
    return {
      id: cadData.incident_number,
      timestamp: normalizedTimestamp,
      neighborhood: this.parseNeighborhood(cadData.neighbourhood, cadData.ward),
      units: parsedUnits,
      type: finalType,
      priority: priority,
      status: status,
      address: this.parseAddress(cadData.neighbourhood, cadData.ward),
      unitHistory,
      closedTime: cadData.closed_time,
      // Store raw data for reference
      incident_number: cadData.incident_number,
      call_time: cadData.call_time,
      incident_type: rawType,
      responding_units: cadData.units,
      closed_time: cadData.closed_time,
      district: cadData.ward,
      motor_vehicle_incident: cadData.motor_vehicle_incident
    };
  }

  private parseNeighborhood(neighbourhood: string, ward: string): string {
    const safeNeighbourhood = neighbourhood || '';
    const safeWard = ward || '';
    
    if (safeNeighbourhood.trim()) {
      return safeNeighbourhood.trim();
    }
    
    if (safeWard.trim()) {
      return `Ward ${safeWard.trim()}`;
    }
    
    return 'Unknown';
  }

  private parseUnits(unitsString: string): string[] {
    const safeUnitsString = unitsString || '';
    if (!safeUnitsString.trim()) {
      return [];
    }
    
    // Split by multiple delimiters and clean up
    const rawUnits = safeUnitsString
      .split(/[,;|\t\s]+/)
      .map(unit => unit.trim())
      .filter(unit => unit.length > 0);
    
    const parsedUnits: string[] = [];
    
    for (const rawUnit of rawUnits) {
      const cleanUnit = rawUnit.toUpperCase().trim();
      
      // Skip common non-unit words
      if (['AND', 'PLUS', 'WITH', 'ALSO', 'RESPONDING', 'DISPATCH', 'DISPATCHED'].includes(cleanUnit)) {
        continue;
      }
      
      // Parse different unit formats
      const unitPatterns = [
        { regex: /^E(\d+)$/i, format: (match: RegExpMatchArray) => `E${match[1]}` },
        { regex: /^ENGINE(\d+)$/i, format: (match: RegExpMatchArray) => `E${match[1]}` },
        { regex: /^L(\d+)$/i, format: (match: RegExpMatchArray) => `L${match[1]}` },
        { regex: /^LADDER(\d+)$/i, format: (match: RegExpMatchArray) => `L${match[1]}` },
        { regex: /^R(\d+)$/i, format: (match: RegExpMatchArray) => `R${match[1]}` },
        { regex: /^RESCUE(\d+)$/i, format: (match: RegExpMatchArray) => `R${match[1]}` },
        { regex: /^S(\d+)$/i, format: (match: RegExpMatchArray) => `S${match[1]}` },
        { regex: /^SQUAD(\d+)$/i, format: (match: RegExpMatchArray) => `S${match[1]}` },
        { regex: /^SPECIAL(\d+)$/i, format: (match: RegExpMatchArray) => `S${match[1]}` },
        { regex: /^SUPPORT(\d+)$/i, format: (match: RegExpMatchArray) => `S${match[1]}` },
        { regex: /^D(\d+)$/i, format: (match: RegExpMatchArray) => `D${match[1]}` },
        { regex: /^DISTRICT(\d+)$/i, format: (match: RegExpMatchArray) => `D${match[1]}` },
        { regex: /^FI(\d+)$/i, format: (match: RegExpMatchArray) => `FI${match[1]}` },
        { regex: /^FIRE(\d+)$/i, format: (match: RegExpMatchArray) => `FI${match[1]}` },
        { regex: /^P(\d+)$/i, format: (match: RegExpMatchArray) => match[1] },
        { regex: /^(\d{1,3})$/i, format: (match: RegExpMatchArray) => match[1] },
      ];
      
      let matched = false;
      for (const pattern of unitPatterns) {
        const match = cleanUnit.match(pattern.regex);
        if (match) {
          const formattedUnit = pattern.format(match);
          if (!parsedUnits.includes(formattedUnit)) {
            parsedUnits.push(formattedUnit);
          }
          matched = true;
          break;
        }
      }
      
      // If no pattern matched but looks like a unit, keep it
      if (!matched && cleanUnit.length > 0 && cleanUnit.length < 10) {
        if (/^[A-Z]+\d+$/.test(cleanUnit) || /^\d+[A-Z]*$/.test(cleanUnit)) {
          if (!parsedUnits.includes(cleanUnit)) {
            parsedUnits.push(cleanUnit);
          }
        }
      }
      
    }
    
    // Remove duplicates while preserving order
    const uniqueUnits = [...new Set(parsedUnits)];
    
    return uniqueUnits.slice(0, 15);
  }

  private parseAddress(neighbourhood: string, ward: string): string {
    const safeNeighbourhood = neighbourhood || '';
    const safeWard = ward || '';
    
    if (safeNeighbourhood.trim()) {
      return safeNeighbourhood.trim();
    }
    
    if (safeWard.trim()) {
      return `Ward ${safeWard.trim()}`;
    }
    
    return 'Location not specified';
  }

  private normalizeIncidentType(type: string): string {
    const safeType = type || '';
    if (!safeType.trim()) return 'Unknown';
    
    const normalized = safeType.toLowerCase().trim();
    
    const typeMap: { [key: string]: string } = {
      'fire rescue - outdoor': 'Outdoor Fire/Rescue',
      'fire rescue - indoor': 'Indoor Fire/Rescue', 
      'fire rescue - vehicle': 'Vehicle Fire/Rescue',
      'fire rescue - structure': 'Structure Fire/Rescue',
      'medical': 'Medical Emergency', 
      'ems': 'Medical Emergency',
      'mva': 'Motor Vehicle Accident',
      'mvc': 'Motor Vehicle Collision',
      'alarm activation': 'Alarm Activation',
      'hazmat': 'Hazardous Materials',
    };
    
    if (typeMap[normalized]) {
      return typeMap[normalized];
    }
    
    for (const [key, value] of Object.entries(typeMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }
    
    return safeType.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private determinePriority(type: string): Incident['priority'] {
    const safeType = type || '';
    if (!safeType.trim()) return 'LOW';
    
    const normalized = safeType.toLowerCase();
    
    const criticalKeywords = [
      'structure fire', 'building fire', 'house fire', 'cardiac', 'heart attack', 
      'stroke', 'unconscious', 'not breathing', 'explosion', 'hazmat'
    ];
    
    if (criticalKeywords.some(keyword => normalized.includes(keyword))) {
      return 'CRITICAL';
    }
    
    const highKeywords = [
      'medical emergency', 'ems', 'motor vehicle accident', 'mva', 'collision',
      'vehicle fire', 'gas leak', 'chest pain', 'difficulty breathing'
    ];
    
    if (highKeywords.some(keyword => normalized.includes(keyword))) {
      return 'HIGH';
    }
    
    const mediumKeywords = [
      'alarm', 'grass fire', 'brush fire', 'lift assist', 'welfare check'
    ];
    
    if (mediumKeywords.some(keyword => normalized.includes(keyword))) {
      return 'MEDIUM';
    }
    
    return 'LOW';
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
}

export const winnipegCADService = new WinnipegCADService();