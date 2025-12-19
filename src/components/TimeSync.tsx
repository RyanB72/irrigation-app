import { useState, useEffect } from 'react';
import { useBluetooth } from '../hooks/useBluetooth';

export function TimeSync() {
  const { setTime, lastResponse } = useBluetooth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle response
  useEffect(() => {
    if (lastResponse?.cmd === 'set_time') {
      if (lastResponse.status === 'ok') {
        setIsSyncing(false);
        // Could show success message
      } else {
        setIsSyncing(false);
        alert('Failed to sync time: ' + (lastResponse.message || 'Unknown error'));
      }
    }
  }, [lastResponse]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await setTime();
    } catch (error) {
      console.error('Failed to sync time:', error);
      setIsSyncing(false);
      alert('Failed to sync time');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Current Time</div>
          <div className="text-xl font-semibold text-gray-800">{formatTime(currentTime)}</div>
          <div className="text-xs text-gray-500">{formatDate(currentTime)}</div>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
            ${isSyncing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-water-500 text-white hover:bg-water-600 shadow-md hover:shadow-lg'
            }
          `}
        >
          <svg
            className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isSyncing ? 'Syncing...' : 'Sync Time'}
        </button>
      </div>
    </div>
  );
}
