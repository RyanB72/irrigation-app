import { useState, useCallback, useEffect } from 'react';
import { bluetoothService } from '../services/bluetooth.service';
import { useIrrigationState } from './useIrrigationState';
import type { BLECommand, BLEResponse } from '../types/irrigation.types';

export function useBluetooth() {
  const { isConnected, isConnecting, connectionError, deviceName, setConnectionState } = useIrrigationState();
  const [lastResponse, setLastResponse] = useState<BLEResponse | null>(null);

  // Setup response listener
  useEffect(() => {
    bluetoothService.onResponse((response: BLEResponse) => {
      console.log('Response received:', response);
      setLastResponse(response);
    });
  }, []);

  // Connect to device
  const connect = useCallback(async () => {
    setConnectionState(false, true, null, null);

    try {
      await bluetoothService.connect();
      const name = bluetoothService.getDeviceName();
      setConnectionState(true, false, null, name);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionState(false, false, errorMessage, null);
      throw error;
    }
  }, [setConnectionState]);

  // Disconnect from device
  const disconnect = useCallback(async () => {
    await bluetoothService.disconnect();
    setConnectionState(false, false, null, null);
  }, [setConnectionState]);

  // Send command to device
  const sendCommand = useCallback(async (command: BLECommand) => {
    if (!isConnected) {
      throw new Error('Not connected to device');
    }
    await bluetoothService.sendCommand(command);
  }, [isConnected]);

  // Helper: Get system status
  const getStatus = useCallback(async () => {
    await sendCommand({ cmd: 'get_status' });
  }, [sendCommand]);

  // Helper: Start zone manually
  const startZone = useCallback(async (zone: number, duration: number) => {
    await sendCommand({
      cmd: 'start_zone',
      zone,
      duration,
    });
  }, [sendCommand]);

  // Helper: Stop watering
  const stopWatering = useCallback(async () => {
    await sendCommand({ cmd: 'stop' });
  }, [sendCommand]);

  // Helper: Get program
  const getProgram = useCallback(async (zone: number, prog: number) => {
    await sendCommand({
      cmd: 'get_program',
      zone,
      prog,
    });
  }, [sendCommand]);

  // Helper: Set program
  const setProgram = useCallback(async (
    zone: number,
    prog: number,
    start: string,
    days: string,
    duration: number,
    enabled: boolean
  ) => {
    await sendCommand({
      cmd: 'set_program',
      zone,
      prog,
      start,
      days,
      duration,
      enabled,
    });
  }, [sendCommand]);

  // Helper: Set time on controller
  const setTime = useCallback(async (time?: string) => {
    let timeStr = time;
    if (!timeStr) {
      // Format local time as "YYYY-MM-DDTHH:mm:ss" (not UTC)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      timeStr = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }
    await sendCommand({
      cmd: 'set_time',
      time: timeStr,
    });
  }, [sendCommand]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    error: connectionError,
    deviceName,

    // Actions
    connect,
    disconnect,
    sendCommand,

    // Helper actions
    getStatus,
    startZone,
    stopWatering,
    getProgram,
    setProgram,
    setTime,

    // Response
    lastResponse,
  };
}
