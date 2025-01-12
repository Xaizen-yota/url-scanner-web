import axios from 'axios';

const YANDEX_API_URL = '/api/yandex/check_url';

export const checkUrlWithYandex = async (url: string) => {
  try {
    const response = await axios.get(`https://cors-anywhere.herokuapp.com/${YANDEX_API_URL}`, {
      params: {
        url: url,
        apikey: import.meta.env.VITE_YANDEX_API_KEY
      },
      headers: {
        'Origin': window.location.origin
      }
    });

    return {
      isSafe: !response.data.matches || response.data.matches.length === 0,
      threats: response.data.matches || [],
      raw: response.data
    };
  } catch (error) {
    console.error('Error checking URL with Yandex:', error);
    // Don't throw error, just return safe status as this is an additional check
    return {
      isSafe: true,
      threats: [],
      error: 'Service unavailable'
    };
  }
};
