import axios from 'axios';
import { keyManager } from './keyManagementService';

const BACKEND_URL = 'http://localhost:3002';

interface VirusTotalResponse {
  scan_id: string;
  verbose_msg: string;
  response_code: number;
}

export const scanUrlWithVirusTotal = async (url: string): Promise<VirusTotalResponse> => {
  try {
    console.log('Sending request to backend for URL:', url);
    const response = await axios.post(`${BACKEND_URL}/api/virustotal`, { url });
    console.log('Response from backend:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error scanning URL with VirusTotal:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};
