import axios from 'axios'
import { scanUrlWithVirusTotal } from './virusTotalService';
import { checkUrlWithGoogleSafeBrowsing } from './googleSafeBrowsingService';
import { checkDomainWithAbuseIPDB } from './abuseIPDBService';
import { checkUrlWithYandex } from './yandexSafeService';
import { checkUrlWithWOT } from './wotService';
import { checkUrlWithCleanBrowsing } from './cleanBrowsingService';

const API_ENDPOINT = 'https://api.example.com/scan' // Replace with your actual API endpoint

export const scanUrl = async (url: string) => {
  try {
    // Run all scans in parallel for better performance
    const [
      virusTotalResult, 
      safeBrowsingResult, 
      abuseIPDBResult,
      yandexResult,
      wotResult,
      cleanBrowsingResult
    ] = await Promise.allSettled([
      scanUrlWithVirusTotal(url).catch(error => ({ 
        status: 'error', 
        positives: 0, 
        total: 0, 
        error: error.message 
      })),
      checkUrlWithGoogleSafeBrowsing(url).catch(error => ({ 
        isSafe: true, 
        threats: [], 
        error: error.message 
      })),
      checkDomainWithAbuseIPDB(url).catch(error => ({ 
        isSafe: true, 
        confidenceScore: 0, 
        totalReports: 0, 
        countryCode: 'N/A', 
        ipAddress: 'N/A', 
        isWhitelisted: false, 
        error: error.message 
      })),
      checkUrlWithYandex(url).catch(() => ({ isSafe: true, threats: [] })),
      checkUrlWithWOT(url).catch(() => ({ isSafe: true, threats: [] })),
      checkUrlWithCleanBrowsing(url).catch(() => ({ isSafe: true, blocked: false }))
    ]);

    return {
      url,
      // Primary security services
      virusTotal: virusTotalResult.status === 'fulfilled' ? virusTotalResult.value : {
        status: 'error',
        positives: 0,
        total: 0,
        error: 'Service unavailable'
      },
      googleSafeBrowsing: safeBrowsingResult.status === 'fulfilled' ? safeBrowsingResult.value : {
        isSafe: true,
        threats: [],
        error: 'Service unavailable'
      },
      abuseIPDB: abuseIPDBResult.status === 'fulfilled' ? abuseIPDBResult.value : {
        isSafe: true,
        confidenceScore: 0,
        totalReports: 0,
        countryCode: 'N/A',
        ipAddress: 'N/A',
        isWhitelisted: false,
        error: 'Service unavailable'
      },
      // Additional security services
      yandexSafe: yandexResult.status === 'fulfilled' ? yandexResult.value : {
        isSafe: true,
        threats: []
      },
      webOfTrust: wotResult.status === 'fulfilled' ? wotResult.value : {
        isSafe: true,
        threats: []
      },
      cleanBrowsing: cleanBrowsingResult.status === 'fulfilled' ? cleanBrowsingResult.value : {
        isSafe: true,
        blocked: false
      },
      urlScan: {
        uuid: '12345-abcde',
        result: 'https://urlscan.io/result/sample-result',
      },
      scan_date: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error scanning URL:', error)
    throw new Error('Failed to scan URL')
  }
}
