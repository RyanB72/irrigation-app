import { useBluetooth } from '../hooks/useBluetooth';

export function ConnectionStatus() {
  const { isConnected, isConnecting, error, deviceName, connect, disconnect } = useBluetooth();

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-gray-300'
          }`}
        />
        <span className="font-semibold">
          {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
        </span>
      </div>

      {deviceName && <div className="text-sm text-gray-600 mb-2">{deviceName}</div>}

      {error && (
        <div className="text-sm text-red-600 mb-2 bg-red-50 p-2 rounded">{error}</div>
      )}

      {!isConnected && !isConnecting && (
        <button
          onClick={connect}
          className="w-full bg-water-500 hover:bg-water-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Connect via BLE
        </button>
      )}

      {isConnected && (
        <button
          onClick={disconnect}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Disconnect
        </button>
      )}
    </div>
  );
}
