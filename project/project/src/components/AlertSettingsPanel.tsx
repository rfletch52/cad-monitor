import React, { useState } from 'react';
import { AlertSettings } from '../types';
import { X, Volume2, VolumeX, Play, Bell, MapPin, AlertTriangle, Car } from 'lucide-react';
import { audioService } from '../services/audioService';

interface AlertSettingsPanelProps {
  onClose: () => void;
  alertSettings: AlertSettings;
  onUpdateSettings: (settings: AlertSettings) => void;
  availableNeighborhoods: string[];
  availableEventTypes: string[];
}

export const AlertSettingsPanel: React.FC<AlertSettingsPanelProps> = ({
  onClose,
  alertSettings,
  onUpdateSettings,
  availableNeighborhoods,
  availableEventTypes
}) => {
  const [settings, setSettings] = useState<AlertSettings>({
    enabled: alertSettings.enabled ?? false,
    audioEnabled: alertSettings.audioEnabled ?? false,
    vibrationEnabled: alertSettings.vibrationEnabled ?? true,
    neighborhoods: alertSettings.neighborhoods ?? [],
    eventTypes: alertSettings.eventTypes ?? [],
    priorities: alertSettings.priorities ?? ['CRITICAL', 'HIGH'],
    motorVehicleIncidents: alertSettings.motorVehicleIncidents ?? true,
    volume: alertSettings.volume ?? 0.7,
    alertSound: alertSettings.alertSound ?? 'beep',
    unitAlertEnabled: alertSettings.unitAlertEnabled ?? true,
    unitAlertSound: alertSettings.unitAlertSound ?? 'chime'
  });
  const [testingSound, setTestingSound] = useState(false);

  const handleSave = () => {
    onUpdateSettings(settings);
    onClose();
  };

  const handleTestSound = async () => {
    setTestingSound(true);
    try {
      console.log('Testing sound:', settings.alertSound, 'volume:', settings.volume);
      await audioService.playAlert(settings.alertSound, settings.volume);
    } catch (error) {
      console.error('Error playing test sound:', error);
    }
    setTimeout(() => setTestingSound(false), 2000);
  };

  const toggleNeighborhood = (neighborhood: string) => {
    const newNeighborhoods = settings.neighborhoods.includes(neighborhood)
      ? settings.neighborhoods.filter(n => n !== neighborhood)
      : [...settings.neighborhoods, neighborhood];
    
    setSettings({ ...settings, neighborhoods: newNeighborhoods });
  };

  const toggleEventType = (eventType: string) => {
    const newEventTypes = settings.eventTypes.includes(eventType)
      ? settings.eventTypes.filter(t => t !== eventType)
      : [...settings.eventTypes, eventType];
    
    setSettings({ ...settings, eventTypes: newEventTypes });
  };

  const togglePriority = (priority: AlertSettings['priorities'][0]) => {
    const newPriorities = settings.priorities.includes(priority)
      ? settings.priorities.filter(p => p !== priority)
      : [...settings.priorities, priority];
    
    setSettings({ ...settings, priorities: newPriorities });
  };

  const selectAllNeighborhoods = () => {
    setSettings({ ...settings, neighborhoods: [...availableNeighborhoods] });
  };

  const clearAllNeighborhoods = () => {
    setSettings({ ...settings, neighborhoods: [] });
  };

  const selectAllEventTypes = () => {
    setSettings({ ...settings, eventTypes: [...availableEventTypes] });
  };

  const clearAllEventTypes = () => {
    setSettings({ ...settings, eventTypes: [] });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden transition-colors duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Bell size={20} className="text-blue-600" />
            <span>Alert Settings</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Master Alert Toggle */}
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Enable Alerts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Master switch for all alert notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.enabled && (
              <>
                {/* Audio Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                    <Volume2 size={20} className="text-green-600" />
                    <span>Audio Alerts</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.audioEnabled}
                          onChange={(e) => setSettings({ ...settings, audioEnabled: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Audio Alerts</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.vibrationEnabled}
                          onChange={(e) => setSettings({ ...settings, vibrationEnabled: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Vibration (Mobile)</span>
                      </label>

                      {settings.audioEnabled && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Alert Sound
                            </label>
                            <select
                              value={settings.alertSound}
                              onChange={(e) => setSettings({ ...settings, alertSound: e.target.value as AlertSettings['alertSound'] })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="beep">Beep</option>
                              <option value="siren">Siren</option>
                              <option value="chime">Chime</option>
                              <option value="horn">Horn</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Volume: {Math.round(settings.volume * 100)}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={settings.volume}
                              onChange={(e) => setSettings({ ...settings, volume: parseFloat(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {settings.audioEnabled && (
                      <div className="flex items-center justify-center">
                        <button
                          onClick={handleTestSound}
                          disabled={testingSound}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                            testingSound
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          <Play size={16} />
                          <span>{testingSound ? 'Playing...' : 'Test Sound'}</span>
                        </button>
                      </div>
                    )}

                    {settings.vibrationEnabled && (
                      <div className="flex items-center justify-center">
                        <button
                          onClick={async () => {
                            try {
                              console.log('Testing vibration...');
                              await audioService.playAlert(settings.alertSound, 0, true);
                            } catch (error) {
                              console.error('Error testing vibration:', error);
                            }
                          }}
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                        >
                          <span>📳</span>
                          <span>Test Vibration</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Unit Alert Settings */}
                  {settings.audioEnabled && (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Unit Addition Alerts</h4>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.unitAlertEnabled}
                          onChange={(e) => setSettings({ ...settings, unitAlertEnabled: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Alert when units are added to incidents</span>
                      </label>

                      {settings.unitAlertEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Unit Alert Sound
                            </label>
                            <select
                              value={settings.unitAlertSound}
                              onChange={(e) => setSettings({ ...settings, unitAlertSound: e.target.value as AlertSettings['unitAlertSound'] })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="beep">Beep</option>
                              <option value="siren">Siren</option>
                              <option value="chime">Chime</option>
                              <option value="horn">Horn</option>
                            </select>
                          </div>

                          <div className="flex items-center justify-center">
                            <button
                              onClick={async () => {
                                try {
                                  await audioService.playAlert(settings.unitAlertSound, settings.volume * 0.7, settings.vibrationEnabled);
                                } catch (error) {
                                  console.error('Error testing unit alert sound:', error);
                                }
                              }}
                              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                            >
                              <Play size={16} />
                              <span>Test Unit Alert</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Priority Filters */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                    <AlertTriangle size={20} className="text-orange-600" />
                    <span>Priority Levels</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(priority => (
                      <label key={priority} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.priorities.includes(priority)}
                          onChange={() => togglePriority(priority)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm font-medium px-2 py-1 rounded ${
                          priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {priority}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Motor Vehicle Incidents */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                    <Car size={20} className="text-blue-600" />
                    <span>Special Incident Types</span>
                  </h3>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.motorVehicleIncidents}
                      onChange={(e) => setSettings({ ...settings, motorVehicleIncidents: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Motor Vehicle Incidents</span>
                  </label>
                </div>

                {/* Neighborhoods */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                      <MapPin size={20} className="text-purple-600" />
                      <span>Neighborhoods ({settings.neighborhoods.length} selected)</span>
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={selectAllNeighborhoods}
                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={clearAllNeighborhoods}
                        className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {availableNeighborhoods.map(neighborhood => (
                        <label key={neighborhood} className="flex items-center space-x-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={settings.neighborhoods.includes(neighborhood)}
                            onChange={() => toggleNeighborhood(neighborhood)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">{neighborhood}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Event Types */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                      <AlertTriangle size={20} className="text-red-600" />
                      <span>Event Types ({settings.eventTypes.length} selected)</span>
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={selectAllEventTypes}
                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={clearAllEventTypes}
                        className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {availableEventTypes.map(eventType => (
                        <label key={eventType} className="flex items-center space-x-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={settings.eventTypes.includes(eventType)}
                            onChange={() => toggleEventType(eventType)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">{eventType}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p>• Haptic feedback available on supported mobile devices</p>
                    <p>• Keeps screen awake during monitoring</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Alert settings are saved locally in your browser
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};