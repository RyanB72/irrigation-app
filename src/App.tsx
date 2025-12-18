import { ConnectionStatus } from './components/ConnectionStatus';
import { useBluetooth } from './hooks/useBluetooth';

function App() {
  const { isConnected } = useBluetooth();

  return (
    <div className="min-h-screen flex flex-col">
      <ConnectionStatus />

      {/* Header */}
      <header className="pt-8 pb-4 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Irrigation Controller
        </h1>
        <p className="text-gray-600">
          Smart watering system with Bluetooth control
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {!isConnected ? (
          <div className="text-center max-w-md">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto bg-water-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-16 h-16 text-water-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Connect to Your Controller
            </h2>

            <ul className="text-left space-y-2 mb-6 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-water-500">✓</span>
                <span>Control 4 irrigation zones</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-water-500">✓</span>
                <span>Schedule automated watering</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-water-500">✓</span>
                <span>Manual zone control</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-water-500">✓</span>
                <span>Works offline via Bluetooth</span>
              </li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-semibold mb-1">Before connecting:</p>
              <p>Press the Bluetooth pairing button on your ESP32C3 controller (D0/GPIO2)</p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                3D Visualization Coming Soon
              </h2>
              <div className="bg-gradient-to-br from-water-50 to-green-50 rounded-lg h-64 flex items-center justify-center mb-6">
                <p className="text-gray-500 text-lg">
                  Isometric irrigation box will appear here
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Zone 1</div>
                  <div className="text-xl font-semibold text-gray-800">Idle</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Zone 2</div>
                  <div className="text-xl font-semibold text-gray-800">Idle</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Zone 3</div>
                  <div className="text-xl font-semibold text-gray-800">Idle</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Zone 4</div>
                  <div className="text-xl font-semibold text-gray-800">Idle</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>Built with React, Three.js, and Web Bluetooth</p>
      </footer>
    </div>
  );
}

export default App;
