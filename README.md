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

## Live Demo

**✅ Deployed to Production**
- GitHub: https://github.com/RyanB72/irrigation-app
- Auto-deploy on push to `main`
- Access via Vercel deployment URL

## Getting Started

### Prerequisites

- Chrome or Edge browser (for Web Bluetooth support)
- ESP32C3 irrigation controller with Bluetooth enabled

### Using Production Deployment

1. **Visit the Vercel deployment URL** on your phone or desktop (Chrome/Edge)
2. **Enable BLE on ESP32C3**: Press the Bluetooth pairing button (D0/GPIO2) on your controller
3. **Connect**: Click "Connect via BLE" button in the app
4. **Select Device**: Choose "Irrigation Controller" from the browser dialog
5. **Control**: Manage zones and schedules through the UI

### Local Development

**Installation:**
```bash
npm install
```

**Development server:**
```bash
npm run dev              # Local only
npm run dev -- --host    # Network accessible for phone testing
```

**Build for production:**
```bash
npm run build
npm run preview
```

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

### Phase 1: MVP Foundation ✅
- [x] Bluetooth connection
- [x] Basic UI layout
- [x] GitHub repository
- [x] Vercel deployment with auto-deploy
- [x] Production testing via mobile
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

**✅ Currently Deployed to Vercel**
- Auto-deploy enabled on push to `main`
- HTTPS enabled (required for Web Bluetooth)
- Edge CDN distribution

**To deploy changes:**
```bash
git add .
git commit -m "Your changes"
git push
# Vercel auto-deploys in ~2-3 minutes
```

## License

Open source - MIT License
