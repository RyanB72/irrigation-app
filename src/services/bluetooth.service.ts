import type { BLECommand, BLEResponse } from '../types/irrigation.types';

// BLE UUIDs from ESP32C3 irrigation controller
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_COMMAND_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const CHARACTERISTIC_RESPONSE_UUID = '1c95d5e3-d8f7-413a-bf3d-7a2e5d7be87e';

export class BluetoothService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private commandCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private responseCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private responseCallback: ((response: BLEResponse) => void) | null = null;

  /**
   * Check if Web Bluetooth is supported
   */
  isSupported(): boolean {
    return 'bluetooth' in navigator;
  }

  /**
   * Connect to irrigation controller via BLE
   */
  async connect(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported in this browser. Please use Chrome or Edge.');
    }

    try {
      console.log('Requesting Bluetooth device...');

      // Request device
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ name: 'Irrigation Controller' }],
        optionalServices: [SERVICE_UUID]
      });

      console.log('Device selected:', this.device.name);

      // Add disconnect listener
      this.device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));

      // Connect to GATT server
      console.log('Connecting to GATT server...');
      this.server = await this.device.gatt!.connect();

      // Get service
      console.log('Getting service...');
      const service = await this.server.getPrimaryService(SERVICE_UUID);

      // Get characteristics
      console.log('Getting characteristics...');
      this.commandCharacteristic = await service.getCharacteristic(CHARACTERISTIC_COMMAND_UUID);
      this.responseCharacteristic = await service.getCharacteristic(CHARACTERISTIC_RESPONSE_UUID);

      // Start notifications
      console.log('Starting notifications...');
      await this.responseCharacteristic.startNotifications();
      this.responseCharacteristic.addEventListener(
        'characteristicvaluechanged',
        this.handleResponse.bind(this)
      );

      console.log('✅ Connected to irrigation controller');
    } catch (error) {
      console.error('Connection failed:', error);
      this.cleanup();
      throw error;
    }
  }

  /**
   * Disconnect from device
   */
  async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.cleanup();
  }

  /**
   * Send command to ESP32C3
   */
  async sendCommand(command: BLECommand): Promise<void> {
    if (!this.commandCharacteristic) {
      throw new Error('Not connected to device');
    }

    try {
      const json = JSON.stringify(command);
      console.log('Sending command:', json);
      const encoder = new TextEncoder();
      await this.commandCharacteristic.writeValue(encoder.encode(json));
    } catch (error) {
      console.error('Failed to send command:', error);
      throw error;
    }
  }

  /**
   * Set callback for responses
   */
  onResponse(callback: (response: BLEResponse) => void): void {
    this.responseCallback = callback;
  }

  /**
   * Get device connection status
   */
  isConnected(): boolean {
    return this.device?.gatt?.connected ?? false;
  }

  /**
   * Get connected device name
   */
  getDeviceName(): string | null {
    return this.device?.name ?? null;
  }

  /**
   * Handle incoming response from ESP32C3
   */
  private handleResponse(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;

    if (!value) return;

    try {
      const decoder = new TextDecoder();
      const json = decoder.decode(value);
      console.log('Received response:', json);

      const response: BLEResponse = JSON.parse(json);

      if (this.responseCallback) {
        this.responseCallback(response);
      }
    } catch (error) {
      console.error('Failed to parse response:', error);
    }
  }

  /**
   * Handle disconnection
   */
  private onDisconnected(): void {
    console.log('❌ Device disconnected');
    this.cleanup();
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.server = null;
    this.commandCharacteristic = null;
    this.responseCharacteristic = null;
    this.responseCallback = null;
  }
}

// Singleton instance
export const bluetoothService = new BluetoothService();
