import React, { useMemo } from 'react';
import { Incident } from '../types';
import { Users, Radio, Clock, MapPin, AlertTriangle, Building2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateTimeElapsed } from '../utils/timeUtils';
import wfpsRoster from '../data/wfps-roster.json';
import { UnitInfoBubble } from './UnitInfoBubble';

interface UnitRosterProps {
  incidents: Incident[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  isCompact: boolean;
  onToggleCompact: () => void;
}

interface UnitStatus {
  unit: string;
  status: 'ASSIGNED' | 'AVAILABLE';
  incident?: Incident;
  deployedTime?: string;
  location?: string;
  station: string;
  stationName: string;
  stationAddress: string;
  unitType: string;
  model?: string;
  specs?: string;
  notes?: string;
}

interface StationRoster {
  stationId: string;
  stationName: string;
  stationAddress: string;
  units: UnitStatus[];
  assignedCount: number;
  availableCount: number;
}

export const UnitRoster: React.FC<UnitRosterProps> = ({ incidents, isExpanded, onToggleExpanded, isCompact, onToggleCompact }) => {
  const [selectedUnit, setSelectedUnit] = React.useState<{
    unit: UnitStatus;
    position: { x: number; y: number };
  } | null>(null);

  // Helper function to find unit information from roster
  const findUnitInfo = (unitId: string) => {
    // Normalize unit ID for lookup
    let normalizedUnit = unitId.toUpperCase();
    
    // Search through all stations
    for (const [stationId, station] of Object.entries(wfpsRoster.stations)) {
      for (const [unitKey, unitData] of Object.entries(station.units)) {
        // Direct match first
        if (unitKey === normalizedUnit) {
          return {
            station: stationId,
            stationName: station.name,
            stationAddress: station.address,
            unitType: unitData.type,
            model: unitData.model,
            specs: unitData.specs,
            notes: unitData.notes
          };
        }
      }
    }
    
    // If no direct match, try variations
    const possibleUnits = [normalizedUnit];
    
    // Handle engine designations - E101, E102, etc. should map to 101, 102, etc.
    if (normalizedUnit.startsWith('E') && normalizedUnit.length > 1) {
      const engineNumber = normalizedUnit.substring(1);
      possibleUnits.push(engineNumber);
    }
    
    // Handle numeric units that might need E prefix
    if (normalizedUnit.match(/^\d{2,3}$/)) {
      possibleUnits.push(`E${normalizedUnit}`);
    }
    
    // Handle paramedic units with leading zeros
    if (normalizedUnit.match(/^\d{1,2}$/)) {
      possibleUnits.push(normalizedUnit.padStart(2, '0'));
    }
    
    // Handle BISON units - BISON1, BISON2, etc. should map to BN1, BN2, etc.
    if (normalizedUnit.startsWith('BISON') && normalizedUnit.length > 5) {
      const bisonNumber = normalizedUnit.substring(5);
      possibleUnits.push(`BN${bisonNumber}`);
    }
    
    // Search again with variations
    for (const [stationId, station] of Object.entries(wfpsRoster.stations)) {
      for (const [unitKey, unitData] of Object.entries(station.units)) {
        if (possibleUnits.includes(unitKey)) {
          return {
            station: stationId,
            stationName: station.name,
            stationAddress: station.address,
            unitType: unitData.type,
            model: unitData.model,
            specs: unitData.specs,
            notes: unitData.notes
          };
        }
      }
    }
    
    return null;
  };

  const stationRoster = useMemo(() => {
    // Get all active incidents (not resolved)
    const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
    
    // Track deployed units
    const deployedUnits = new Map<string, { incident: Incident; deployedTime: string; location: string }>();
    activeIncidents.forEach(incident => {
      incident.units.forEach(unit => {
        deployedUnits.set(unit, {
          incident,
          deployedTime: incident.timestamp,
          location: incident.neighborhood
        });
      });
    });
    
    // Get all units that have ever been seen (including resolved incidents)
    const allSeenUnits = new Set<string>();
    incidents.forEach(incident => {
      incident.units.forEach(unit => allSeenUnits.add(unit));
    });
    
    // Build station roster
    const stationMap = new Map<string, StationRoster>();
    
    // Initialize all stations from roster
    Object.entries(wfpsRoster.stations).forEach(([stationId, station]) => {
      stationMap.set(stationId, {
        stationId,
        stationName: station.name,
        stationAddress: station.address,
        units: [],
        assignedCount: 0,
        availableCount: 0
      });
    });
    
    // Add units from roster
    Object.entries(wfpsRoster.stations).forEach(([stationId, station]) => {
      const stationRoster = stationMap.get(stationId)!;
      
      Object.entries(station.units).forEach(([unitKey, unitData]) => {
        const deployment = deployedUnits.get(unitKey);
        const status: 'ASSIGNED' | 'AVAILABLE' = deployment ? 'ASSIGNED' : 'AVAILABLE';
        
        const unitStatus: UnitStatus = {
          unit: unitKey,
          status,
          incident: deployment?.incident,
          deployedTime: deployment?.deployedTime,
          location: deployment?.location,
          station: stationId,
          stationName: station.name,
          stationAddress: station.address,
          unitType: unitData.type,
          model: unitData.model,
          specs: unitData.specs,
          notes: unitData.notes
        };
        
        stationRoster.units.push(unitStatus);
        
        if (status === 'ASSIGNED') {
          stationRoster.assignedCount++;
        } else {
          stationRoster.availableCount++;
        }
      });
    });
    
    // Add any units seen in incidents that aren't in the roster (unknown units)
    allSeenUnits.forEach(unit => {
      const unitInfo = findUnitInfo(unit);
      if (!unitInfo) {
        // Unknown unit - add to a generic "Unknown" station
        let unknownStation = stationMap.get('unknown');
        if (!unknownStation) {
          unknownStation = {
            stationId: 'unknown',
            stationName: 'Unknown Units',
            stationAddress: 'Location Unknown',
            units: [],
            assignedCount: 0,
            availableCount: 0
          };
          stationMap.set('unknown', unknownStation);
        }
        
        const deployment = deployedUnits.get(unit);
        const status: 'ASSIGNED' | 'AVAILABLE' = deployment ? 'ASSIGNED' : 'AVAILABLE';
        
        const unitStatus: UnitStatus = {
          unit,
          status,
          incident: deployment?.incident,
          deployedTime: deployment?.deployedTime,
          location: deployment?.location,
          station: 'unknown',
          stationName: 'Unknown Units',
          stationAddress: 'Location Unknown',
          unitType: 'Unknown',
          model: 'Unknown',
          specs: 'Unknown'
        };
        
        unknownStation.units.push(unitStatus);
        
        if (status === 'ASSIGNED') {
          unknownStation.assignedCount++;
        } else {
          unknownStation.availableCount++;
        }
      }
    });
    
    // Sort stations by number, then by name
    return Array.from(stationMap.values())
      .filter(station => station.units.length > 0) // Only show stations with units
      .sort((a, b) => {
        // Handle numeric station IDs
        const aNum = parseInt(a.stationId);
        const bNum = parseInt(b.stationId);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        
        // Put unknown at the end
        if (a.stationId === 'unknown') return 1;
        if (b.stationId === 'unknown') return -1;
        
        return a.stationName.localeCompare(b.stationName);
      });
  }, [incidents]);

  const getUnitTypeColor = (unitType: string, status: 'ASSIGNED' | 'AVAILABLE') => {
    // Units on call get a distinct red background regardless of type
    if (status === 'ASSIGNED') {
      return 'bg-red-600 text-white border-2 border-red-400 shadow-lg';
    }
    
    // Available units get type-specific colors
    const availableColors = {
      'Engine': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700',
      'Ladder': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-700',
      'Rescue': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700',
      'Paramedic': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700',
      'District Chief': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700',
      'District Chief Paramedic': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700',
      'Hazmat': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700',
      'Tanker': 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-700',
      'Water Rescue': 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700',
      'Safety': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700',
      'Fire Investigator': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700',
      'Bison': 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700',
      'Wildland': 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700',
      'Wildland Emergency Response': 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700',
      'Rehab': 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700',
      'Chase Car': 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700',
      'EPIC': 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
    };
    
    return availableColors[unitType as keyof typeof availableColors] || 
           'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700';
  };

  const getPriorityIcon = (incident?: Incident) => {
    if (!incident) return null;
    
    switch (incident.priority) {
      case 'CRITICAL':
        return <AlertTriangle size={12} className="text-red-500" />;
      case 'HIGH':
        return <AlertTriangle size={12} className="text-orange-500" />;
      default:
        return null;
    }
  };

  const totalAssigned = stationRoster.reduce((sum, station) => sum + station.assignedCount, 0);
  const totalAvailable = stationRoster.reduce((sum, station) => sum + station.availableCount, 0);

  const handleUnitClick = (unit: UnitStatus, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2 - 160, // Center bubble on unit (160px = half bubble width)
      y: rect.bottom + 10 // Position below the unit
    };
    
    setSelectedUnit({ unit, position });
  };

  const handleCloseBubble = () => {
    setSelectedUnit(null);
  };

  return (
    <>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Building2 size={20} className="text-blue-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Unit Roster by Station</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleCompact}
            className={`flex items-center space-x-1 px-3 py-1 text-sm rounded transition-colors ${
              isCompact 
                ? 'bg-purple-500 text-white hover:bg-purple-600' 
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            <span>{isCompact ? 'Normal' : 'Compact'}</span>
          </button>
          <button
            onClick={onToggleExpanded}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Summary Stats - Always Visible */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Radio size={16} className="text-red-600" />
            <span className="text-lg font-bold text-red-800 dark:text-red-200">{totalAssigned}</span>
          </div>
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">Assigned to Call</p>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Users size={16} className="text-green-600" />
            <span className="text-lg font-bold text-green-800 dark:text-green-200">{totalAvailable}</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">Available</p>
        </div>
      </div>

      {/* Detailed Station Roster - Collapsible */}
      {isExpanded && (
        <>
          {/* Station Roster */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {stationRoster.map(station => (
              <div key={station.stationId} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                {/* Station Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {station.stationName}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{station.stationAddress}</p>
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-300">{station.assignedCount}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-300">{station.availableCount}</span>
                    </span>
                  </div>
                </div>

                {/* Units Grid */}
                <div className={`grid gap-2 ${
                  isCompact 
                    ? 'grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12' 
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                }`}>
                  {station.units
                    .sort((a, b) => {
                      // Sort by status first (assigned first), then by unit name
                      if (a.status !== b.status) {
                        return a.status === 'ASSIGNED' ? -1 : 1;
                      }
                      return a.unit.localeCompare(b.unit, undefined, { numeric: true });
                    })
                    .map(unit => (
                      <div
                        key={unit.unit}
                        onClick={(e) => handleUnitClick(unit, e)}
                        className={`rounded font-medium transition-colors ${getUnitTypeColor(unit.unitType, unit.status)} ${
                          isCompact ? 'p-1 text-xs' : 'p-2 text-xs'
                        } cursor-pointer hover:shadow-md active:scale-95 transform transition-transform`}
                        title={`${unit.unit} - ${unit.unitType} - ${unit.status} ${unit.incident ? `(${unit.incident.type} in ${unit.location})` : ''} ${unit.model ? `- ${unit.model}` : ''}`}
                      >
                        {isCompact ? (
                          // Compact view - just unit number
                          <div className="text-center">
                            <span className="font-mono font-bold text-xs">{unit.unit}</span>
                          </div>
                        ) : (
                          // Normal view - full details
                          <>
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold">{unit.unit}</span>
                              {getPriorityIcon(unit.incident)}
                            </div>
                            <div className="text-xs opacity-75 truncate">{unit.unitType}</div>
                            {unit.status === 'ASSIGNED' && unit.deployedTime && (
                              <div className="flex items-center space-x-1 text-xs opacity-75 mt-1">
                                <Clock size={8} />
                                <span>{calculateTimeElapsed(unit.deployedTime)}</span>
                              </div>
                            )}
                            {unit.status === 'ASSIGNED' && unit.incident && (
                              <div className="text-xs opacity-75 truncate mt-1" title={unit.incident.type}>
                                {unit.incident.type}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Assigned to Call</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-100 dark:bg-green-900 border border-green-500 rounded"></div>
                  <span>Available</span>
                </div>
              </div>
              <p>• Hover over units for detailed information</p>
              <p>• Units sorted by assignment status, then by unit number</p>
            </div>
          </div>
        </>
      )}
    </div>

    {/* Unit Info Bubble */}
    {selectedUnit && (
      <UnitInfoBubble
        unit={selectedUnit.unit.unit}
        unitType={selectedUnit.unit.unitType}
        model={selectedUnit.unit.model}
        specs={selectedUnit.unit.specs}
        notes={selectedUnit.unit.notes}
        stationName={selectedUnit.unit.stationName}
        stationAddress={selectedUnit.unit.stationAddress}
        status={selectedUnit.unit.status}
        incident={selectedUnit.unit.incident}
        deployedTime={selectedUnit.unit.deployedTime}
        location={selectedUnit.unit.location}
        position={selectedUnit.position}
        onClose={handleCloseBubble}
      />
    )}
    </>
  );
};