// TypeScript interfaces matching the ESP32C3 irrigation controller

export interface Program {
  enabled: boolean;
  startHours: number[];      // 4 start times per program
  startMinutes: number[];
  daysOfWeek: number;        // Bitmask: Sun=1, Mon=2, Tue=4, Wed=8, Thu=16, Fri=32, Sat=64
  duration: number;          // Minutes
}

export interface ZoneConfig {
  name: string;
  programs: Program[];       // 3 programs per zone
  masterValveRequired: boolean;
}

export interface SystemState {
  activeZone: number;        // 0 = idle, 1-4 = zone running
  zoneDuration: number;
  zoneStartTime: number;
  manualMode: boolean;
  btPairingEnabled: boolean;
  currentTime?: string;
}

export interface BLECommand {
  cmd: 'get_status' | 'start_zone' | 'stop' | 'set_program' | 'get_program' | 'set_time';
  zone?: number;
  prog?: number;
  duration?: number;
  start?: string;
  days?: string;
  enabled?: boolean;
  time?: string;
}

export interface BLEResponse {
  status: 'ok' | 'error';
  message?: string;
  cmd?: string;
  active_zone?: number;
  duration?: number;
  manual?: boolean;
  time?: string;
  enabled?: boolean;
  start?: string;
  days?: string;
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  device?: BluetoothDevice;
  error?: string;
}

// Day of week helper
export const DAYS = {
  SUNDAY: 0b00000001,
  MONDAY: 0b00000010,
  TUESDAY: 0b00000100,
  WEDNESDAY: 0b00001000,
  THURSDAY: 0b00010000,
  FRIDAY: 0b00100000,
  SATURDAY: 0b01000000,
  ALL: 0b01111111,
} as const;

export const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

// Zone status for UI
export type ZoneStatus = 'idle' | 'active' | 'error';
