import axios from 'axios';

const BACKEND_URL = 'http://localhost:3002';

interface YandexResponse {
  matches?: Array<{
    threatType: string;
    platformType: string;
    threat: { url: string };
  }>;
}

export const checkUrlWithYandex = async (url: string): Promise<YandexResponse> => {
  try {
    console.log('Sending request to backend for URL:', url);
    const response = await axios.post(`${BACKEND_URL}/api/yandex`, { url });
    console.log('Response from backend:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error checking URL with Yandex:', error);
    throw error;
  }
};
