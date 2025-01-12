import { API_KEYS } from '../config/apiKeys';

interface KeyUsage {
  count: number;
  lastReset: Date;
  isUsingBackup: boolean;
}

class KeyManagementService {
  private keyUsage: Map<string, KeyUsage>;
  private readonly MONTHLY_LIMITS = {
    virusTotal: 500,      // Example limit
    abuseIPDB: 1000,      // Example limit
    googleSafeBrowsing: 1000  // Example limit
  };

  constructor() {
    this.keyUsage = new Map();
    this.initializeKeyUsage();
  }

  private initializeKeyUsage() {
    Object.keys(API_KEYS).forEach(service => {
      this.keyUsage.set(service, {
        count: 0,
        lastReset: new Date(),
        isUsingBackup: false
      });
    });
  }

  private shouldResetCount(lastReset: Date): boolean {
    const now = new Date();
    return now.getMonth() !== lastReset.getMonth() || 
           now.getFullYear() !== lastReset.getFullYear();
  }

  getApiKey(service: keyof typeof API_KEYS): string {
    const usage = this.keyUsage.get(service);
    if (!usage) {
      return API_KEYS[service].primary;
    }

    // Reset counter if it's a new month
    if (this.shouldResetCount(usage.lastReset)) {
      usage.count = 0;
      usage.lastReset = new Date();
      usage.isUsingBackup = false;
      this.keyUsage.set(service, usage);
      return API_KEYS[service].primary;
    }

    // Switch to backup key if primary key limit is reached
    if (usage.count >= this.MONTHLY_LIMITS[service] && !usage.isUsingBackup) {
      usage.isUsingBackup = true;
      usage.count = 0;
      this.keyUsage.set(service, usage);
      console.log(`Switching to backup key for ${service}`);
      return API_KEYS[service].backup;
    }

    // Increment usage count
    usage.count++;
    this.keyUsage.set(service, usage);

    return usage.isUsingBackup ? API_KEYS[service].backup : API_KEYS[service].primary;
  }

  getRemainingQuota(service: keyof typeof API_KEYS): number {
    const usage = this.keyUsage.get(service);
    if (!usage) return this.MONTHLY_LIMITS[service];

    return this.MONTHLY_LIMITS[service] - usage.count;
  }

  isUsingBackupKey(service: keyof typeof API_KEYS): boolean {
    return this.keyUsage.get(service)?.isUsingBackup || false;
  }
}

export const keyManager = new KeyManagementService();
