import axios from 'axios';

const BACKEND_URL = 'http://localhost:3002';

interface WOTResponse {
  target: string;
  categories: {
    [key: string]: {
      confidence: number;
      severity: number;
    };
  };
}

export const checkUrlWithWOT = async (url: string): Promise<WOTResponse> => {
  try {
    console.log('Sending request to backend for URL:', url);
    const response = await axios.post(`${BACKEND_URL}/api/wot`, { url });
    console.log('Response from backend:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error checking URL with WOT:', error);
    throw error;
  }
};
