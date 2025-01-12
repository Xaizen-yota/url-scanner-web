const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);

  // Log response
  const oldSend = res.send;
  res.send = function(data) {
    console.log(`Response time: ${Date.now() - start}ms`);
    console.log('Response:', typeof data === 'string' ? data : JSON.stringify(data));
    return oldSend.apply(res, arguments);
  };

  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'URL Scanner API Server',
    endpoints: [
      '/health',
      '/api/virustotal',
      '/api/abuseipdb',
      '/api/yandex',
      '/api/wot'
    ]
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      VT_API_KEY: process.env.VT_API_KEY ? 'Present' : 'Missing',
      ABUSE_API_KEY: process.env.ABUSE_API_KEY ? 'Present' : 'Missing'
    }
  });
});

// VirusTotal endpoint
app.post('/api/virustotal', async (req, res) => {
  const { url } = req.body;
  console.log('VirusTotal request for URL:', url);
  
  if (!process.env.VT_API_KEY) {
    console.error('VirusTotal API key is missing');
    return res.status(500).json({ error: 'VirusTotal API key is not configured' });
  }

  try {
    // First, get URL identifier
    const urlId = Buffer.from(url).toString('base64');
    console.log('URL identifier:', urlId);

    // Try to get existing analysis first
    console.log('Checking existing analysis...');
    try {
      const analysisResponse = await axios({
        method: 'get',
        url: `https://www.virustotal.com/api/v3/urls/${urlId}`,
        headers: {
          'x-apikey': process.env.VT_API_KEY,
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('Found existing analysis:', analysisResponse.data);
      return res.json(analysisResponse.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        throw error;
      }
      console.log('No existing analysis found, submitting URL for scanning...');
    }

    // Submit URL for scanning
    console.log('Submitting URL for analysis...');
    const formData = new URLSearchParams();
    formData.append('url', url);

    const scanResponse = await axios({
      method: 'post',
      url: 'https://www.virustotal.com/api/v3/urls',
      data: formData,
      headers: {
        'x-apikey': process.env.VT_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('Scan submitted:', scanResponse.data);
    
    // Wait for analysis to complete
    const analysisId = scanResponse.data.data.id;
    console.log('Analysis ID:', analysisId);
    
    // Poll for results
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      console.log(`Checking analysis status (attempt ${attempts + 1}/${maxAttempts})...`);
      
      const analysisResponse = await axios({
        method: 'get',
        url: `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        headers: {
          'x-apikey': process.env.VT_API_KEY,
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      if (analysisResponse.data.data.attributes.status === 'completed') {
        console.log('Analysis completed:', analysisResponse.data);
        return res.json(analysisResponse.data);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
    
    throw new Error('Analysis timed out');
  } catch (error) {
    console.error('VirusTotal error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    res.status(500).json({ 
      error: 'VirusTotal API error',
      details: error.response?.data || error.message 
    });
  }
});

// AbuseIPDB endpoint
app.post('/api/abuseipdb', async (req, res) => {
  const { url } = req.body;
  console.log('AbuseIPDB request for URL:', url);
  
  if (!process.env.ABUSE_API_KEY) {
    console.error('AbuseIPDB API key is missing');
    return res.status(500).json({ error: 'AbuseIPDB API key is not configured' });
  }

  try {
    const domain = new URL(url).hostname;
    console.log('Checking domain:', domain);

    // First try to resolve domain to IP
    console.log('Resolving domain to IP...');
    const dnsResponse = await axios({
      method: 'get',
      url: `https://dns.google/resolve?name=${domain}`,
      timeout: 5000
    });

    if (!dnsResponse.data.Answer) {
      throw new Error('Could not resolve domain to IP address');
    }

    const ip = dnsResponse.data.Answer[0].data;
    console.log('Resolved IP:', ip);

    console.log('Sending request to AbuseIPDB...');
    const abuseResponse = await axios({
      method: 'get',
      url: 'https://api.abuseipdb.com/api/v2/check',
      headers: {
        'Key': process.env.ABUSE_API_KEY,
        'Accept': 'application/json'
      },
      params: { 
        ipAddress: ip,
        maxAgeInDays: 90,
        verbose: true
      },
      timeout: 10000
    });
    
    console.log('AbuseIPDB response:', abuseResponse.data);
    res.json({
      ...abuseResponse.data,
      resolvedIp: ip,
      domain: domain
    });
  } catch (error) {
    console.error('AbuseIPDB error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    res.status(500).json({ 
      error: 'AbuseIPDB API error',
      details: error.response?.data || error.message,
      domain: domain
    });
  }
});

// Yandex Safe Browsing endpoint
app.post('/api/yandex', async (req, res) => {
  const { url } = req.body;
  console.log('Yandex request for URL:', url);

  try {
    const response = await axios({
      method: 'post',
      url: 'https://sba.yandex.net/v4/threatMatches:find',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: {
        client: {
          clientId: "url-scanner",
          clientVersion: "1.0.0"
        },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url: url }]
        }
      },
      timeout: 10000
    });

    console.log('Yandex response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Yandex error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    res.status(500).json({
      error: 'Yandex API error',
      details: error.response?.data || error.message
    });
  }
});

// WOT (Web of Trust) endpoint
app.post('/api/wot', async (req, res) => {
  const { url } = req.body;
  console.log('WOT request for URL:', url);

  try {
    const domain = new URL(url).hostname;
    const response = await axios({
      method: 'get',
      url: `https://scorecard.api.mywot.com/v3/targets/${domain}`,
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    console.log('WOT response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('WOT error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    res.status(500).json({
      error: 'WOT API error',
      details: error.response?.data || error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment variables loaded:');
  console.log('VT_API_KEY:', process.env.VT_API_KEY ? 'Present' : 'Missing');
  console.log('ABUSE_API_KEY:', process.env.ABUSE_API_KEY ? 'Present' : 'Missing');
});
