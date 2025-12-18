import { create } from 'zustand';
import type { SystemState, ZoneConfig } from '../types/irrigation.types';

interface IrrigationStore {
  // System state
  systemState: SystemState;
  zones: ZoneConfig[];

  // Actions
  setSystemState: (state: Partial<SystemState>) => void;
  setZone: (index: number, zone: ZoneConfig) => void;
  setActiveZone: (zone: number, duration: number) => void;
  clearActiveZone: () => void;
}

export const useIrrigationState = create<IrrigationStore>((set) => ({
  // Initial system state
  systemState: {
    activeZone: 0,
    zoneDuration: 0,
    zoneStartTime: 0,
    manualMode: false,
    btPairingEnabled: false,
  },

  // Initial zones (4 zones with 3 programs each)
  zones: Array.from({ length: 4 }, (_, i) => ({
    name: `Zone ${i + 1}`,
    programs: Array.from({ length: 3 }, () => ({
      enabled: false,
      startHours: [255, 255, 255, 255],
      startMinutes: [0, 0, 0, 0],
      daysOfWeek: 0,
      duration: 10,
    })),
    masterValveRequired: false,
  })),

  // Actions
  setSystemState: (state) =>
    set((prev) => ({
      systemState: { ...prev.systemState, ...state },
    })),

  setZone: (index, zone) =>
    set((prev) => ({
      zones: prev.zones.map((z, i) => (i === index ? zone : z)),
    })),

  setActiveZone: (zone, duration) =>
    set((prev) => ({
      systemState: {
        ...prev.systemState,
        activeZone: zone,
        zoneDuration: duration,
        zoneStartTime: Date.now(),
        manualMode: true,
      },
    })),

  clearActiveZone: () =>
    set((prev) => ({
      systemState: {
        ...prev.systemState,
        activeZone: 0,
        zoneDuration: 0,
        zoneStartTime: 0,
        manualMode: false,
      },
    })),
}));
