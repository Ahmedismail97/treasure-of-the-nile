import QRCode from 'qrcode';
import crypto from 'crypto';
import { Station } from '../models';
import { IQRValidationResult } from '../types';

interface QRData {
  type: string;
  stationId: number;
  stationNumber: number;
  token: string;
  timestamp: number;
}

class QRService {
  /**
   * Generate QR code data for a station
   * Creates a secure, unique token that can't be guessed
   */
  async generateStationQR(stationId: number): Promise<{
    qrData: string;
    qrImageUrl: string;
    station: {
      id: number;
      stationNumber: number;
      title: string;
    };
  }> {
    try {
      const station = await Station.findByPk(stationId);
      if (!station) {
        throw new Error('Station not found');
      }

      // Create secure QR data
      const qrData: QRData = {
        type: 'treasure_hunt_station',
        stationId: station.id,
        stationNumber: station.stationNumber,
        token: crypto.randomBytes(32).toString('hex'),
        timestamp: Date.now()
      };

      // Encode as base64
      const encoded = Buffer.from(JSON.stringify(qrData)).toString('base64');

      // Save to station
      await station.update({ qrCode: encoded });

      // Generate QR code image as data URL
      const qrImageUrl = await QRCode.toDataURL(encoded, {
        errorCorrectionLevel: 'H',
        width: 400,
        margin: 2,
        color: {
          dark: '#1A3A52', // Deep blue
          light: '#F5F5DC'  // Beige
        }
      });

      return {
        qrData: encoded,
        qrImageUrl,
        station: {
          id: station.id,
          stationNumber: station.stationNumber,
          title: station.title
        }
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Validate scanned QR code
   */
  async validateQRScan(qrData: string, expectedStationId: number | null = null): Promise<IQRValidationResult> {
    try {
      // Decode QR data
      const decoded: QRData = JSON.parse(Buffer.from(qrData, 'base64').toString());

      // Validate structure
      if (decoded.type !== 'treasure_hunt_station') {
        return { valid: false, reason: 'Invalid QR code type' };
      }

      if (!decoded.stationId || !decoded.token) {
        return { valid: false, reason: 'Corrupted QR code data' };
      }

      // Validate against database
      const station = await Station.findByPk(decoded.stationId);
      if (!station) {
        return { valid: false, reason: 'Station not found' };
      }

      if (!station.isActive) {
        return { valid: false, reason: 'Station is inactive' };
      }

      if (station.qrCode !== qrData) {
        return { valid: false, reason: 'QR code mismatch or expired' };
      }

      // If specific station expected, validate it matches
      if (expectedStationId && decoded.stationId !== expectedStationId) {
        return {
          valid: false,
          reason: `Wrong station! This is ${station.title}`,
          actualStation: station.stationNumber
        };
      }

      return {
        valid: true,
        stationId: station.id,
        stationNumber: station.stationNumber,
        station
      };
    } catch (error) {
      console.error('Error validating QR scan:', error);
      return { valid: false, reason: 'Invalid or corrupted QR code' };
    }
  }

  /**
   * Generate QR codes for all stations (for printing)
   */
  async generateAllStationQRs(): Promise<Array<{
    qrData: string;
    qrImageUrl: string;
    station: {
      id: number;
      stationNumber: number;
      title: string;
    };
  }>> {
    try {
      const stations = await Station.findAll({
        where: { isActive: true },
        order: [['stationNumber', 'ASC']]
      });

      const qrCodes = [];

      for (const station of stations) {
        const qr = await this.generateStationQR(station.id);
        qrCodes.push(qr);
      }

      return qrCodes;
    } catch (error) {
      console.error('Error generating all QR codes:', error);
      throw error;
    }
  }

  /**
   * Regenerate QR code for a station (if compromised)
   */
  async regenerateStationQR(stationId: number): Promise<{
    qrData: string;
    qrImageUrl: string;
    station: {
      id: number;
      stationNumber: number;
      title: string;
    };
  }> {
    try {
      // Clear old QR code
      const station = await Station.findByPk(stationId);
      if (station) {
        await station.update({ qrCode: null });
      }

      // Generate new one
      return await this.generateStationQR(stationId);
    } catch (error) {
      console.error('Error regenerating QR code:', error);
      throw error;
    }
  }
}

export default new QRService();

