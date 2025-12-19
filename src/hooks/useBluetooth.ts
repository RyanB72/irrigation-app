import { useState, useCallback, useEffect } from 'react';
import { bluetoothService } from '../services/bluetooth.service';
import type { BLECommand, BLEResponse, ConnectionState } from '../types/irrigation.types';

export function useBluetooth() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
  });

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
    setConnectionState({ isConnected: false, isConnecting: true });

    try {
      await bluetoothService.connect();
      setConnectionState({
        isConnected: true,
        isConnecting: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionState({
        isConnected: false,
        isConnecting: false,
        error: errorMessage,
      });
      throw error;
    }
  }, []);

  // Disconnect from device
  const disconnect = useCallback(async () => {
    await bluetoothService.disconnect();
    setConnectionState({
      isConnected: false,
      isConnecting: false,
    });
  }, []);

  // Send command to device
  const sendCommand = useCallback(async (command: BLECommand) => {
    if (!connectionState.isConnected) {
      throw new Error('Not connected to device');
    }
    await bluetoothService.sendCommand(command);
  }, [connectionState.isConnected]);

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
    const timeStr = time || new Date().toISOString().slice(0, 19);
    await sendCommand({
      cmd: 'set_time',
      time: timeStr,
    });
  }, [sendCommand]);

  return {
    // Connection state
    isConnected: connectionState.isConnected,
    isConnecting: connectionState.isConnecting,
    error: connectionState.error,
    deviceName: bluetoothService.getDeviceName(),

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
