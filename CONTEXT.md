# Irrigation Controller Web App - Development Context

## Project Overview

**Goal**: Build a modern Progressive Web App (PWA) for controlling the ESP32C3 (Seeed XIAO) irrigation system via Bluetooth Low Energy (BLE).

**Key Features**:
- Real-time BLE control of 4 irrigation zones
- Schedule management (3 programs per zone, 4 start times per program)
- Isometric 2.5D visualization of irrigation controller box
- Works on mobile (Chrome/Edge) and desktop
- Installable as PWA

## Hardware Context

**ESP32C3 Controller** (Located at: `/home/ltsryan/irrigation/`)
- **Board**: Seeed XIAO ESP32C3 (11 GPIO pins)
- **Pin Mapping**:
  - Zone outputs: D1(GPIO3), D4(GPIO6), D5(GPIO7), D10(GPIO10)
  - Buttons: D0(GPIO2)=BT pairing, D8(GPIO8)=MenuUp, D7(GPIO20)=MenuDown, D9(GPIO9/BOOT)=MenuSelect
  - I2C: D2(GPIO4)=SDA, D3(GPIO5)=SCL
- **RTC**: DS3231 (optional - has software clock fallback)
- **Display**: Display emulator via Serial Monitor (no physical OLED yet)
- **Current State**: Fully functional with LED testing, BLE working, software clock running

**Important Notes**:
- Avoid GPIO 5,6,7 (JTAG/SPI) and GPIO 21 (UART TX - always HIGH)
- GPIO 2,8,9 are strapping pins (OK for inputs)
- BLE pairing timeout: 5 minutes
- BLE device name: "Irrigation Controller"

## Tech Stack

**Frontend Framework**:
- React 18.3+ with TypeScript
- Vite 7.3.0 (build tool, dev server)
- Tailwind CSS v3 (styling with custom water theme)

**State Management**:
- Zustand (lightweight store for irrigation state)

**3D Graphics** (Ready, not yet implemented):
- Three.js
- React-Three-Fiber (R3F)
- @react-three/drei (helpers)

**BLE Communication**:
- Web Bluetooth API (native browser support)
- Custom service wrapper in `bluetooth.service.ts`

**PWA** (Installed, not configured yet):
- vite-plugin-pwa
- Workbox (for offline caching)

## Project Structure

```
/home/ltsryan/irrigation-app/
├── src/
│   ├── components/
│   │   └── ConnectionStatus.tsx      # BLE connection UI widget (top-right)
│   ├── hooks/
│   │   ├── useBluetooth.ts           # Custom hook for BLE operations
│   │   └── useIrrigationState.ts     # Zustand store for app state
│   ├── services/
│   │   └── bluetooth.service.ts      # Web Bluetooth API wrapper
│   ├── types/
│   │   └── irrigation.types.ts       # TypeScript interfaces matching ESP32 protocol
│   ├── App.tsx                       # Main app component
│   ├── index.css                     # Tailwind imports + base styles
│   └── main.tsx                      # React entry point
├── public/                           # Static assets
├── tailwind.config.js                # Tailwind config with water theme colors
├── postcss.config.js                 # PostCSS config
├── vite.config.ts                    # Vite build config
├── package.json                      # Dependencies
├── README.md                         # User-facing documentation
└── CONTEXT.md                        # This file (development context)
```

## What We Built (Phase 1 - MVP Foundation)

### 1. Bluetooth Service Layer (`src/services/bluetooth.service.ts`)

**Singleton service** handling all BLE communication:
- Device discovery and connection
- GATT server/service/characteristic access
- Command sending (JSON over BLE)
- Response listening (notifications)
- Automatic reconnection handling
- Disconnect event handling

**BLE Protocol Details**:
```
Service UUID: 4fafc201-1fb5-459e-8fcc-c5c9c331914b
Command Characteristic: beb5483e-36e1-4688-b7f5-ea07361b26a8 (write)
Response Characteristic: 1c95d5e3-d8f7-413a-bf3d-7a2e5d7be87e (read/notify)
```

**JSON Command Format**:
```typescript
// Get status
{"cmd":"get_status"}

// Start zone manually
{"cmd":"start_zone","zone":1,"duration":10}

// Stop watering
{"cmd":"stop"}

// Set program
{"cmd":"set_program","zone":1,"prog":0,"start":"07:30","days":"SMTWTFS","duration":15,"enabled":true}

// Get program
{"cmd":"get_program","zone":1,"prog":0}

// Set time (optional, has software clock)
{"cmd":"set_time","time":"2025-12-18T14:30:00"}
```

**Response Format**:
```typescript
{"status":"ok","cmd":"get_status","active_zone":0,"time":"09:30"}
{"status":"error","message":"Invalid zone"}
```

### 2. React Hooks

**`useBluetooth()` hook**:
- Manages connection state
- Provides helper methods: `connect()`, `disconnect()`, `sendCommand()`
- Shortcuts: `getStatus()`, `startZone()`, `stopWatering()`, `setProgram()`, `getProgram()`
- Returns: connection status, device name, last response

**`useIrrigationState()` hook (Zustand)**:
- Global state store for 4 zones with 3 programs each
- System state: active zone, duration, manual mode, BT pairing status
- Actions: `setSystemState()`, `setZone()`, `setActiveZone()`, `clearActiveZone()`

### 3. TypeScript Type System

**Core Interfaces** (`src/types/irrigation.types.ts`):
```typescript
interface Program {
  enabled: boolean;
  startHours: number[];      // [255, 255, 255, 255] = disabled
  startMinutes: number[];
  daysOfWeek: number;        // Bitmask: 0b01111111 = all days
  duration: number;          // Minutes
}

interface ZoneConfig {
  name: string;
  programs: Program[];       // 3 per zone
  masterValveRequired: boolean;
}

interface SystemState {
  activeZone: number;        // 0 = idle, 1-4 = active
  zoneDuration: number;
  zoneStartTime: number;
  manualMode: boolean;
  btPairingEnabled: boolean;
  currentTime?: string;
}
```

**Day of Week Helpers**:
```typescript
DAYS.SUNDAY = 0b00000001
DAYS.MONDAY = 0b00000010
// ... etc
DAYS.ALL = 0b01111111

DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
```

### 4. UI Components

**ConnectionStatus Component**:
- Floating widget (top-right)
- Shows connection state with color indicator (green=connected, gray=disconnected)
- Connect/Disconnect button
- Device name display
- Error messages

**App.tsx - Main Layout**:
- **Before Connection**: Landing page with features list, instructions to press BT button
- **After Connection**: Placeholder for 3D visualization + 4 zone status cards
- Header with title
- Footer with tech stack credits

### 5. Styling (Tailwind CSS v3)

**Custom Theme** (`tailwind.config.js`):
```javascript
colors: {
  water: {
    50-900: // Blue gradient for water theme
  }
}
```

**Base Styles** (`src/index.css`):
- Gradient background: blue-50 to green-50
- Tailwind directives

## Development Setup

### Installation
```bash
cd /home/ltsryan/irrigation-app
npm install
```

### Development Server

**Local only**:
```bash
npm run dev
# Access: http://localhost:5173/
```

**Network accessible (for phone testing)**:
```bash
npm run dev -- --host
# Access from phone: http://172.30.141.35:5173/
# (PC's local IP may vary)
```

### Build for Production
```bash
npm run build      # Creates dist/ folder
npm run preview    # Test production build
```

## Current State (as of 2025-12-18)

### ✅ Completed
1. ✅ Project initialized (Vite + React + TypeScript)
2. ✅ All dependencies installed (Three.js, Tailwind, Zustand, PWA plugin)
3. ✅ Folder structure created
4. ✅ TypeScript interfaces defined (matching ESP32 protocol)
5. ✅ Bluetooth service layer implemented
6. ✅ React hooks created (useBluetooth, useIrrigationState)
7. ✅ Connection UI component built
8. ✅ Landing page with connection flow
9. ✅ Tailwind CSS configured with water theme
10. ✅ Dev server running with network access
11. ✅ GitHub repository created (https://github.com/RyanB72/irrigation-app)
12. ✅ Vercel deployment configured with auto-deploy on push
13. ✅ TypeScript Web Bluetooth types fixed (@types/web-bluetooth)
14. ✅ Production deployment tested successfully on mobile via BLE

### 🚧 In Progress / Not Started
- [ ] 3D isometric irrigation box visualization (React-Three-Fiber)
- [ ] Manual zone control UI
- [ ] Schedule viewing (read programs from ESP32)
- [ ] Schedule editing (update programs)
- [ ] Real-time status updates (poll get_status)
- [ ] PWA manifest and service worker
- [ ] Icons and splash screens
- [ ] Offline mode
- [ ] Error handling improvements
- [ ] Loading states
- [ ] Animations (water flow, zone highlights)
- [ ] Dark mode
- [ ] Settings screen

## Testing Instructions

### Prerequisites
- ESP32C3 controller powered on
- BLE pairing enabled (press D0/GPIO2 button on controller)
- Chrome or Edge browser (Web Bluetooth required)

### Production Testing (Recommended)
1. **Access Vercel deployment**: Visit your Vercel app URL from phone/desktop Chrome
2. **Press BT button** on ESP32C3 (GPIO2/D0) to enable pairing
3. **Click "Connect via BLE"** in app
4. **Select device** from browser dialog: "Irrigation Controller"
5. **Verify connection**: Green dot appears, device name shown
6. **Test BLE communication** - connection confirmed working!

### Local Development Testing
1. **Start dev server**: `npm run dev -- --host`
2. **Access from phone**: Open Chrome, go to `http://[YOUR_LOCAL_IP]:5173/`
3. Follow steps 2-6 from Production Testing above

### Console Testing Examples
```javascript
// In browser console after connecting:
// (Access via useBluetooth hook - need to expose it or use dev tools)

// Check status
await sendCommand({ cmd: "get_status" })

// Start zone 1 for 5 minutes
await sendCommand({ cmd: "start_zone", zone: 1, duration: 5 })

// Stop watering
await sendCommand({ cmd: "stop" })
```

## Browser Compatibility

### ✅ Fully Supported
- Chrome 89+ (Desktop: Windows/macOS/Linux)
- Chrome 89+ (Android)
- Edge 89+ (Desktop)
- Edge 89+ (Android)

### ⚠️ Limited/No Support
- Safari (iOS 16.4+ has experimental support, buggy)
- Firefox (no Web Bluetooth support)
- Samsung Internet (based on Chromium, may work)

### Workarounds for Unsupported Browsers
- Show error message: "Please use Chrome or Edge"
- Future: Could wrap in Capacitor/Tauri for native app with BLE

## Known Issues & Limitations

### Current Issues
1. **No HTTPS in dev mode**: Local IP works for testing, but production requires HTTPS for Web Bluetooth
2. **No iOS support**: Safari Web Bluetooth is experimental and unreliable
3. **No Firefox support**: Web Bluetooth not implemented

### Design Decisions
- Using Tailwind v3 instead of v4 (PostCSS compatibility)
- Zustand over Redux (simpler, smaller bundle)
- Software clock fallback in ESP32 (no RTC module required for testing)
- Display emulator via Serial on ESP32 (no physical OLED required)

## Next Steps (Priority Order)

### Immediate (Week 1)
1. **3D Visualization**: Build isometric irrigation box with React-Three-Fiber
   - Single box, 4 zone faces
   - Color coding: gray=idle, blue=active, red=error
   - Click zones to select
   - Smooth rotation with OrbitControls

2. **Manual Control UI**: Zone detail screen
   - Duration picker (1-999 minutes)
   - "Start Now" button
   - "Stop" button (if active)
   - Real-time status display

3. **Auto-refresh Status**: Poll ESP32 every 5 seconds
   - Update active zone display
   - Update time display
   - Update connection status

### Short-term (Week 2-3)
4. **Schedule Viewer**: Display existing programs
   - List all 3 programs per zone
   - Show: start time, days, duration, enabled status
   - Fetch from ESP32 on connect

5. **Schedule Editor**: Create/edit programs
   - Time picker (HH:MM)
   - Day selector (tap to toggle S/M/T/W/T/F/S)
   - Duration slider/input
   - Enable/disable toggle
   - Save to ESP32 NVS

6. **Polish**: Animations and feedback
   - Water flow animation when zone active
   - Zone highlight on selection
   - Button press feedback
   - Loading spinners

### Long-term (Week 4+)
7. **PWA Features**:
   - Manifest.json (app name, icons, theme)
   - Service worker (offline caching)
   - Install prompt
   - Offline mode (show last known state)

8. **Advanced Features**:
   - Dark mode
   - Usage tracking/history
   - Multiple device support
   - Notifications (when watering starts/stops)
   - Settings screen

## Deployment Strategy

### Production (ACTIVE)
**✅ Deployed to Vercel**
- GitHub repo: https://github.com/RyanB72/irrigation-app
- Auto-deploy enabled: Every push to `main` triggers new deployment
- HTTPS enabled (required for Web Bluetooth)
- Edge CDN with global distribution
- Access from Vercel dashboard for deployment URL and logs

**Deployment workflow:**
```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push
# Vercel auto-deploys in ~2-3 minutes
```

### Local Development
- Dev server: `npm run dev`
- Network access: `npm run dev -- --host`
- Local testing via phone on same WiFi

## Important Commands Reference

```bash
# Development
npm run dev              # Local only (http://localhost:5173)
npm run dev -- --host    # Network accessible (http://192.168.x.x:5173)

# Build
npm run build           # Production build → dist/
npm run preview         # Preview production build

# Linting
npm run lint            # ESLint check

# Dependencies
npm install             # Install all dependencies
npm install <package>   # Add new dependency
npm install -D <pkg>    # Add dev dependency

# ESP32 (in /home/ltsryan/irrigation)
# Upload via Arduino IDE or:
arduino-cli compile --fqbn esp32:esp32:esp32c3 irrigation.ino
arduino-cli upload -p /dev/ttyUSB0 --fqbn esp32:esp32:esp32c3 irrigation.ino
```

## Architecture Decisions

### Why React?
- Industry standard, huge ecosystem
- Great TypeScript support
- React-Three-Fiber for 3D (easier than raw Three.js)
- Fast development with Vite HMR

### Why Zustand over Redux?
- Simpler API (less boilerplate)
- Better TypeScript inference
- Smaller bundle size (~1kb vs ~3kb)
- No context provider needed
- Perfect for this small-medium app

### Why Tailwind?
- Utility-first = fast iteration
- No CSS file management
- Tree-shaking (unused styles removed)
- Responsive design made easy
- Custom theme (water colors)

### Why PWA over Native App?
- No app store submission
- Instant updates (no approval process)
- Cross-platform (iOS/Android/Desktop)
- Web Bluetooth works in Chrome
- Installable to home screen
- Offline capable with service worker

### Why Not Unity WebGL?
- Large bundle size (10-20MB)
- Slow initial load
- BLE requires JavaScript interop
- Overkill for simple isometric graphics
- React-Three-Fiber is lighter and more web-native

## Resources & References

### Documentation
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber
- Web Bluetooth API: https://web.dev/bluetooth/
- Tailwind CSS: https://tailwindcss.com/docs
- Zustand: https://zustand-demo.pmnd.rs/

### ESP32C3 References
- XIAO ESP32C3 Pinout: https://wiki.seeedstudio.com/XIAO_ESP32C3_Getting_Started/
- Web Bluetooth Samples: https://googlechrome.github.io/samples/web-bluetooth/

### Design Inspiration
- Monument Valley (isometric style)
- Linear app (modern UI)
- Arc browser (clean animations)

## Troubleshooting

### "Web Bluetooth not supported"
- **Solution**: Use Chrome or Edge, not Firefox/Safari

### "Connection failed"
- Check BT button pressed on ESP32 (GPIO2)
- Verify device is advertising ("Irrigation Controller")
- Check BLE timeout (5 minutes)
- Try disconnect and reconnect

### "Can't access from phone"
- Verify same WiFi network
- Check firewall (allow port 5173)
- Try PC's IP: `hostname -I` or `ipconfig` (Windows)
- Restart dev server with `--host` flag

### Tailwind styles not working
- Check `index.css` has `@tailwind` directives
- Verify `tailwind.config.js` content paths
- Clear Vite cache: `rm -rf node_modules/.vite`
- Restart dev server

### Build errors
- Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version (need 18+)
- Check for TypeScript errors: `npm run build`

## Project Timeline

**Started**: December 18, 2025
**Current Phase**: MVP Foundation (Phase 1)
**Estimated MVP**: 2-3 weeks from start
**Estimated Full-Featured**: 4-6 weeks from start

## Contact & Collaboration

This project is open source. The irrigation controller firmware is located at `/home/ltsryan/irrigation/`.

For questions about the ESP32C3 firmware, see `irrigation/README.md`.
For questions about this web app, see `irrigation-app/README.md`.

---

**Last Updated**: 2025-12-18 by Claude (Sonnet 4.5)
**Status**: Phase 1 complete - deployed to production, BLE tested successfully
**Next Phase**: 3D visualization implementation
