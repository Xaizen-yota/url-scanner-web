import axios from 'axios';

const BACKEND_URL = 'http://localhost:3002';

interface AbuseIPDBResponse {
  data: {
    ipAddress: string;
    abuseConfidenceScore: number;
    countryCode?: string;
    totalReports?: number;
  };
}

export const checkDomainWithAbuseIPDB = async (urlString: string): Promise<AbuseIPDBResponse> => {
  try {
    console.log('Sending request to backend for URL:', urlString);
    const response = await axios.post(`${BACKEND_URL}/api/abuseipdb`, { url: urlString });
    console.log('Response from backend:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error checking domain with AbuseIPDB:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};
