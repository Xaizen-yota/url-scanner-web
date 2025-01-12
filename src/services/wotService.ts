import axios from 'axios';

const WOT_API_URL = '/api/wot/search';

interface WOTResponse {
  target: string;
  categories: {
    [key: number]: {
      confidence: number;
    };
  };
}

export const checkUrlWithWOT = async (url: string) => {
  try {
    const response = await axios.get(`https://cors-anywhere.herokuapp.com/${WOT_API_URL}`, {
      params: {
        url: url,
        apikey: import.meta.env.VITE_WOT_API_KEY
      },
      headers: {
        'Origin': window.location.origin
      }
    });
    const data: WOTResponse = response.data;

    // WOT category numbers
    const MALWARE = 101;
    const PHISHING = 102;
    const SCAM = 103;
    const POTENTIALLY_UNSAFE = 104;

    const maliciousCategories = [MALWARE, PHISHING, SCAM, POTENTIALLY_UNSAFE];
    const threats = maliciousCategories
      .filter(cat => data.categories?.[cat]?.confidence > 50)
      .map(cat => ({
        type: cat === 101 ? 'MALWARE' :
              cat === 102 ? 'PHISHING' :
              cat === 103 ? 'SCAM' : 'POTENTIALLY_UNSAFE',
        confidence: data.categories[cat].confidence
      }));

    return {
      isSafe: threats.length === 0,
      threats,
      raw: data
    };
  } catch (error) {
    console.error('Error checking URL with WOT:', error);
    // Don't throw error, just return safe status as this is an additional check
    return {
      isSafe: true,
      threats: [],
      error: 'Service unavailable'
    };
  }
};
