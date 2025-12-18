# Irrigation Controller Web App

Modern Progressive Web App (PWA) for controlling the ESP32C3 irrigation system via Bluetooth.

## Features

- 🌊 Real-time Bluetooth control of 4 irrigation zones
- 📅 Schedule management (3 programs per zone, 4 start times each)
- 📱 Works on mobile and desktop (Chrome/Edge)
- 🔌 Offline-capable PWA
- 🎨 Modern UI with Tailwind CSS
- 🎮 3D visualization (coming soon with React-Three-Fiber)

## Tech Stack

- **React 18** + TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Web Bluetooth API** - BLE communication
- **React-Three-Fiber** - 3D graphics (coming soon)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Chrome or Edge browser (for Web Bluetooth support)
- ESP32C3 irrigation controller with Bluetooth enabled

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 in Chrome or Edge.

### Build for Production

```bash
npm run build
npm run preview
```

## Usage

1. **Enable BLE on ESP32C3**: Press the Bluetooth pairing button (D0/GPIO2) on your controller
2. **Connect**: Click "Connect via BLE" button in the app
3. **Select Device**: Choose "Irrigation Controller" from the browser dialog
4. **Control**: Manage zones and schedules through the UI

## Browser Compatibility

✅ **Supported**:
- Chrome/Edge (Desktop & Android)
- Chrome (macOS/Windows/Linux)

⚠️ **Limited Support**:
- Safari (iOS 16.4+)

❌ **Not Supported**:
- Firefox (no Web Bluetooth)

## Project Structure

```
src/
├── components/       # React components
├── hooks/           # Custom hooks (useBluetooth, useIrrigationState)
├── services/        # Bluetooth service layer
├── types/           # TypeScript interfaces
└── App.tsx          # Main app component
```

## BLE Protocol

Communicates with ESP32C3 using JSON commands over BLE:

**Service UUID**: `4fafc201-1fb5-459e-8fcc-c5c9c331914b`

**Commands**:
- `get_status` - Get system state
- `start_zone` - Manual zone control
- `stop` - Stop watering
- `set_program` - Update schedule
- `get_program` - Fetch schedule

## Development Roadmap

### Phase 1: MVP (Current)
- [x] Bluetooth connection
- [x] Basic UI layout
- [ ] 3D isometric box visualization
- [ ] Manual zone control
- [ ] Schedule viewing

### Phase 2: Full Features
- [ ] Schedule editing
- [ ] Real-time status updates
- [ ] PWA installation
- [ ] Offline mode

### Phase 3: Polish
- [ ] Animations
- [ ] Dark mode
- [ ] Multiple device support
- [ ] Usage tracking

## Deployment

Deploy to Vercel, Netlify, or any static host:

```bash
npm run build
# Upload dist/ folder
```

**Important**: HTTPS required for Web Bluetooth!

## License

Open source - MIT License
