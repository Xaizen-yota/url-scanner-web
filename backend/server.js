const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// URL Scanning endpoint
app.post('/api/scan', async (req, res) => {
  const { url } = req.body;
  
  try {
    // VirusTotal scan
    const vtResponse = await axios.post('https://www.virustotal.com/vtapi/v2/url/scan', null, {
      params: {
        apikey: process.env.VT_API_KEY,
        url: url
      }
    });

    // AbuseIPDB check
    const abuseResponse = await axios.get('https://api.abuseipdb.com/api/v2/check', {
      headers: {
        'Key': process.env.ABUSE_API_KEY,
        'Accept': 'application/json'
      },
      params: {
        domain: new URL(url).hostname
      }
    });

    res.json({
      virusTotal: vtResponse.data,
      abuseIPDB: abuseResponse.data
    });
  } catch (error) {
    console.error('Scan error:', error.message);
    res.status(500).json({ 
      error: 'Failed to scan URL',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
