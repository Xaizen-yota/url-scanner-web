import axios from 'axios';
import { keyManager } from './keyManagementService';

const ABUSEIPDB_API_URL = 'https://api.abuseipdb.com/api/v2';

interface AbuseIPDBResponse {
  data: {
    ipAddress: string;
    isPublic: boolean;
    ipVersion: number;
    isWhitelisted: boolean;
    abuseConfidenceScore: number;
    countryCode: string;
    totalReports: number;
    lastReportedAt: string;
  };
}

export const checkDomainWithAbuseIPDB = async (urlString: string) => {
  try {
    const apiKey = keyManager.getApiKey('abuseIPDB');
    
    // Extract domain from URL
    const url = new URL(urlString.startsWith('http') ? urlString : `http://${urlString}`);
    
    // Get IP address for the domain using DNS lookup
    const response = await axios.get(`https://cors-anywhere.herokuapp.com/${ABUSEIPDB_API_URL}/check`, {
      params: {
        ipAddress: url.hostname,
        maxAgeInDays: 90
      },
      headers: {
        'Key': import.meta.env.VITE_ABUSEIPDB_API_KEY,
        'Accept': 'application/json',
        'Origin': window.location.origin
      }
    });

    const data: AbuseIPDBResponse = response.data;

    return {
      status: 'success',
      ipAddress: data.data.ipAddress,
      confidenceScore: data.data.abuseConfidenceScore,
      totalReports: data.data.totalReports,
      countryCode: data.data.countryCode,
      lastReported: data.data.lastReportedAt,
      isWhitelisted: data.data.isWhitelisted,
      isSafe: data.data.abuseConfidenceScore < 25,
      raw: data,
      usingBackupKey: keyManager.isUsingBackupKey('abuseIPDB'),
      remainingQuota: keyManager.getRemainingQuota('abuseIPDB')
    };
  } catch (error) {
    console.error('Error checking domain with AbuseIPDB:', error);
    throw new Error('Failed to check domain with AbuseIPDB');
  }
};
