import { useState, useEffect } from 'react';
import { useBluetooth } from '../hooks/useBluetooth';
import { DAYS } from '../types/irrigation.types';

interface ZoneConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  zoneNumber: number;
}

export function ZoneConfigModal({ isOpen, onClose, zoneNumber }: ZoneConfigModalProps) {
  const { setProgram, getProgram, lastResponse } = useBluetooth();

  const [startTime, setStartTime] = useState('06:00');
  const [duration, setDuration] = useState(15);
  const [selectedDays, setSelectedDays] = useState(0b01111111); // All days
  const [enabled, setEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load current config when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCurrentConfig();
    }
  }, [isOpen, zoneNumber]);

  // Parse response from get_program
  useEffect(() => {
    if (lastResponse?.cmd === 'get_program' && !isSaving) {
      if (lastResponse.status === 'ok') {
        if (lastResponse.start && lastResponse.start !== 'none') {
          setStartTime(lastResponse.start);
        }
        if (lastResponse.duration !== undefined) {
          setDuration(lastResponse.duration);
        }
        if (lastResponse.enabled !== undefined) {
          setEnabled(lastResponse.enabled);
        }
        if (lastResponse.days) {
          setSelectedDays(parseDaysString(lastResponse.days));
        }
        setIsLoading(false);
      }
    } else if (lastResponse?.cmd === 'set_program') {
      if (lastResponse.status === 'ok') {
        setIsSaving(false);
        onClose();
      } else {
        setIsSaving(false);
        alert('Failed to save: ' + (lastResponse.message || 'Unknown error'));
      }
    }
  }, [lastResponse, isSaving]);

  const loadCurrentConfig = async () => {
    setIsLoading(true);
    try {
      await getProgram(zoneNumber, 0); // Always use program 0
    } catch (error) {
      console.error('Failed to load config:', error);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const daysString = formatDaysString(selectedDays);
      await setProgram(zoneNumber, 0, startTime, daysString, duration, enabled);
      // Response will be handled by useEffect
    } catch (error) {
      console.error('Failed to save:', error);
      setIsSaving(false);
      alert('Failed to save configuration');
    }
  };

  const toggleDay = (dayBit: number) => {
    setSelectedDays(prev => prev ^ dayBit);
  };

  const isDaySelected = (dayBit: number) => {
    return (selectedDays & dayBit) !== 0;
  };

  const formatDaysString = (mask: number): string => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const bits = [
      DAYS.SUNDAY,
      DAYS.MONDAY,
      DAYS.TUESDAY,
      DAYS.WEDNESDAY,
      DAYS.THURSDAY,
      DAYS.FRIDAY,
      DAYS.SATURDAY,
    ];
    return days.map((day, i) => (mask & bits[i]) ? day : '-').join('');
  };

  const parseDaysString = (str: string): number => {
    let mask = 0;
    const bits = [
      DAYS.SUNDAY,
      DAYS.MONDAY,
      DAYS.TUESDAY,
      DAYS.WEDNESDAY,
      DAYS.THURSDAY,
      DAYS.FRIDAY,
      DAYS.SATURDAY,
    ];
    for (let i = 0; i < Math.min(str.length, 7); i++) {
      if (str[i] !== '-') {
        mask |= bits[i];
      }
    }
    return mask;
  };

  if (!isOpen) return null;

  const dayButtons = [
    { name: 'Sun', bit: DAYS.SUNDAY },
    { name: 'Mon', bit: DAYS.MONDAY },
    { name: 'Tue', bit: DAYS.TUESDAY },
    { name: 'Wed', bit: DAYS.WEDNESDAY },
    { name: 'Thu', bit: DAYS.THURSDAY },
    { name: 'Fri', bit: DAYS.FRIDAY },
    { name: 'Sat', bit: DAYS.SATURDAY },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Configure Zone {zoneNumber}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-water-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading configuration...</p>
            </div>
          ) : (
            <>
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Schedule Enabled</span>
                <button
                  onClick={() => setEnabled(!enabled)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${enabled ? 'bg-water-500' : 'bg-gray-300'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${enabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-500 focus:border-transparent"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Days of Week */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Days of Week
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {dayButtons.map((day) => (
                    <button
                      key={day.name}
                      onClick={() => toggleDay(day.bit)}
                      className={`
                        py-2 rounded-lg font-medium transition-all
                        ${isDaySelected(day.bit)
                          ? 'bg-water-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {day.name.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium transition-all
              ${isLoading || isSaving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-water-500 text-white hover:bg-water-600 shadow-md hover:shadow-lg'
              }
            `}
          >
            {isSaving ? 'Saving...' : 'Save to Controller'}
          </button>
        </div>
      </div>
    </div>
  );
}
