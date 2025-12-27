import { useState, useEffect } from 'react';
import { useBluetooth } from '../hooks/useBluetooth';

export function TimeSync() {
  const { setTime, getStatus, lastResponse, isConnected } = useBluetooth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [rtcTime, setRtcTime] = useState<string | null>(null);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch RTC time periodically when connected
  useEffect(() => {
    if (!isConnected) {
      setRtcTime(null);
      return;
    }

    // Fetch immediately on connect
    getStatus();

    // Then fetch every 5 seconds
    const interval = setInterval(() => {
      getStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected, getStatus]);

  // Handle response
  useEffect(() => {
    if (lastResponse?.cmd === 'set_time') {
      if (lastResponse.status === 'ok') {
        setIsSyncing(false);
        // Fetch updated RTC time
        getStatus();
      } else {
        setIsSyncing(false);
        alert('Failed to sync time: ' + (lastResponse.message || 'Unknown error'));
      }
    } else if (lastResponse?.cmd === 'get_status' && lastResponse.status === 'ok') {
      // Update RTC time from status response
      if (lastResponse.time && lastResponse.time !== 'unavailable') {
        setRtcTime(lastResponse.time as string);
      } else {
        setRtcTime(null);
      }
    }
  }, [lastResponse, getStatus]);

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

  const parseRtcTime = (rtcTimeStr: string): Date | null => {
    // Parse "2025-12-27 16:30:00" format
    const match = rtcTimeStr.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
    if (!match) return null;
    const [, year, month, day, hour, minute, second] = match;
    return new Date(
      parseInt(year),
      parseInt(month) - 1, // JS months are 0-indexed
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );
  };

  const getTimeDrift = (): { drift: number; inSync: boolean } | null => {
    if (!rtcTime) return null;
    const rtcDate = parseRtcTime(rtcTime);
    if (!rtcDate) return null;

    const driftSeconds = Math.abs((currentTime.getTime() - rtcDate.getTime()) / 1000);
    const inSync = driftSeconds < 3; // Within 3 seconds = in sync

    return { drift: driftSeconds, inSync };
  };

  const timeDrift = getTimeDrift();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="text-sm text-gray-600 mb-1">Phone Time</div>
          <div className="text-xl font-semibold text-gray-800">{formatTime(currentTime)}</div>
          <div className="text-xs text-gray-500">{formatDate(currentTime)}</div>

          {isConnected && rtcTime && (
            <>
              <div className="text-sm text-gray-600 mt-3 mb-1 flex items-center gap-2">
                ESP32 RTC
                {timeDrift && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    timeDrift.inSync
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {timeDrift.inSync ? '✓ Synced' : `±${Math.round(timeDrift.drift)}s`}
                  </span>
                )}
              </div>
              <div className="text-lg font-semibold text-gray-700">
                {parseRtcTime(rtcTime)?.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            </>
          )}

          {isConnected && !rtcTime && (
            <div className="text-sm text-gray-400 mt-2">RTC unavailable</div>
          )}
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
