import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';

interface SettingsPanelProps {
  onClose: () => void;
  use24HourClock: boolean;
  onToggle24Hour: (use24Hour: boolean) => void;
  showTimersOnCards: boolean;
  onToggleTimersOnCards: (show: boolean) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  onClose, 
  use24HourClock, 
  onToggle24Hour,
  showTimersOnCards,
  onToggleTimersOnCards
}) => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full transition-colors duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Clock Format */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock size={16} />
              <span>Clock Format</span>
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="clockFormat"
                  checked={!use24HourClock}
                  onChange={() => onToggle24Hour(false)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">12-hour</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="clockFormat"
                  checked={use24HourClock}
                  onChange={() => onToggle24Hour(true)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">24-hour</span>
              </label>
            </div>
          </div>

          {/* Timer Display */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock size={16} />
              <span>Timer Display</span>
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="timerDisplay"
                  checked={!showTimersOnCards}
                  onChange={() => onToggleTimersOnCards(false)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Details only</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="timerDisplay"
                  checked={showTimersOnCards}
                  onChange={() => onToggleTimersOnCards(true)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show on cards</span>
              </label>
            </div>
          </div>

          {/* Data Source Info */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span>Data Source</span>
            </label>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <p>• Live data from Winnipeg's official CAD system</p>
              <p>• Updates every 30 seconds automatically</p>
              <p>• Tracks unit assignments and status changes</p>
              <p>• No audio recording or AI processing</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Settings are saved locally in your browser
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {saved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};