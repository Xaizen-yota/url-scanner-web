import axios from 'axios';
import { keyManager } from './keyManagementService';

const VIRUSTOTAL_API_URL = '/api/virustotal';

interface VirusTotalResponse {
  response_code: number;
  verbose_msg: string;
  scan_id?: string;
  permalink?: string;
  positives?: number;
  total?: number;
  scans?: Record<string, {
    detected: boolean;
    result: string;
  }>;
}

export const scanUrlWithVirusTotal = async (url: string): Promise<VirusTotalResponse & { usingBackupKey: boolean; remainingQuota: number }> => {
  try {
    // First, submit URL for scanning
    const scanResponse = await axios.post(`https://cors-anywhere.herokuapp.com/${VIRUSTOTAL_API_URL}/url/scan`, 
      new URLSearchParams({
        url: url,
        apikey: import.meta.env.VITE_VIRUSTOTAL_API_KEY
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': window.location.origin
        }
      }
    );

    // Get the scan ID from the response
    const scanId = scanResponse.data.scan_id;

    // Wait for a few seconds to allow scanning to complete
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Then retrieve the scan results
    const resultResponse = await axios.get(`https://cors-anywhere.herokuapp.com/${VIRUSTOTAL_API_URL}/url/report`, {
      params: {
        resource: scanId,
        apikey: import.meta.env.VITE_VIRUSTOTAL_API_KEY
      },
      headers: {
        'Origin': window.location.origin
      }
    });

    return {
      ...resultResponse.data,
      usingBackupKey: keyManager.isUsingBackupKey('virusTotal'),
      remainingQuota: keyManager.getRemainingQuota('virusTotal')
    };
  } catch (error) {
    console.error('Error scanning URL with VirusTotal:', error);
    throw new Error('Failed to scan URL with VirusTotal');
  }
};
