import axios from 'axios';
import { keyManager } from './keyManagementService';

const SAFE_BROWSING_API_URL = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';

interface ThreatMatch {
  threatType: string;
  platformType: string;
  threat: {
    url: string;
  };
}

export const checkUrlWithGoogleSafeBrowsing = async (url: string) => {
  try {
    const apiKey = keyManager.getApiKey('googleSafeBrowsing');

    const response = await axios.post(
      `${SAFE_BROWSING_API_URL}?key=${apiKey}`,
      {
        client: {
          clientId: 'url-scanner-web',
          clientVersion: '1.0.0'
        },
        threatInfo: {
          threatTypes: [
            'MALWARE',
            'SOCIAL_ENGINEERING',
            'UNWANTED_SOFTWARE',
            'POTENTIALLY_HARMFUL_APPLICATION'
          ],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }]
        }
      }
    );

    const matches: ThreatMatch[] = response.data.matches || [];
    
    return {
      isSafe: !response.data.matches || response.data.matches.length === 0,
      threats: matches.map(match => match.threatType),
      raw: response.data,
      usingBackupKey: keyManager.isUsingBackupKey('googleSafeBrowsing'),
      remainingQuota: keyManager.getRemainingQuota('googleSafeBrowsing')
    };
  } catch (error) {
    console.error('Error checking URL with Google Safe Browsing:', error);
    throw new Error('Failed to check URL with Google Safe Browsing');
  }
};
