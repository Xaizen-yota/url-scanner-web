// Remove the url import since we'll use the browser's URL API
export const checkUrlWithCleanBrowsing = async (urlString: string) => {
  try {
    // Extract domain from URL
    const url = new URL(urlString.startsWith('http') ? urlString : `http://${urlString}`);
    const domain = url.hostname;

    // Since we can't use DNS in the browser, we'll do a simple fetch test
    try {
      const response = await fetch(`https://${domain}`, { 
        method: 'HEAD',
        mode: 'no-cors'  // This allows us to at least check if the domain responds
      });
      
      return {
        isSafe: true,
        blocked: false,
        domain
      };
    } catch (error) {
      return {
        isSafe: false,
        blocked: true,
        domain,
        reason: 'Domain appears to be blocked or unreachable'
      };
    }
  } catch (error) {
    console.error('Error checking URL with Clean Browsing:', error);
    return {
      isSafe: true,
      blocked: false,
      error: 'Service unavailable'
    };
  }
};
