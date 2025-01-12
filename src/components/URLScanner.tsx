import { useState } from 'react'
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  alpha,
  Grid,
  Chip,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import {
  ContentPaste,
  Security,
  Shield,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import toast from 'react-hot-toast'
import { scanUrl } from '../services/scannerService'

interface ScanResult {
  virusTotal: {
    status: string;
    positives: number;
    total: number;
    permalink?: string;
    scans?: any;
    usingBackupKey: boolean;
    remainingQuota: number;
  };
  googleSafeBrowsing: {
    isSafe: boolean;
    threats: string[];
    details?: any;
    usingBackupKey: boolean;
    remainingQuota: number;
  };
  abuseIPDB: {
    isSafe: boolean;
    confidenceScore: number;
    totalReports: number;
    countryCode: string;
    ipAddress: string;
    lastReported?: string;
    isWhitelisted: boolean;
    usingBackupKey: boolean;
    remainingQuota: number;
  };
  yandexSafe?: {
    isSafe: boolean;
    threats: any[];
  };
  webOfTrust?: {
    isSafe: boolean;
    threats: any[];
  };
  cleanBrowsing?: {
    isSafe: boolean;
    blocked: boolean;
    reason?: string;
  };
}

export default function URLScanner() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
    } catch (error) {
      toast.error('Failed to paste from clipboard')
    }
  }

  const handleScan = async () => {
    if (!url) {
      toast.error('Please enter a URL')
      return
    }

    setLoading(true)
    setScanResult(null)

    try {
      const result = await scanUrl(url)
      
      // Handle VirusTotal response
      const vtResponse = 'error' in result.virusTotal 
        ? {
            status: 'error',
            positives: 0,
            total: 0,
            usingBackupKey: false,
            remainingQuota: 0
          }
        : {
            status: result.virusTotal.response_code === 1 ? 'success' : 'error',
            positives: result.virusTotal.positives || 0,
            total: result.virusTotal.total || 0,
            permalink: result.virusTotal.permalink,
            scans: result.virusTotal.scans,
            usingBackupKey: result.virusTotal.usingBackupKey,
            remainingQuota: result.virusTotal.remainingQuota
          };

      // Handle Google Safe Browsing response
      const gsbResponse = 'error' in result.googleSafeBrowsing
        ? {
            isSafe: true,
            threats: [],
            usingBackupKey: false,
            remainingQuota: 0
          }
        : {
            isSafe: result.googleSafeBrowsing.isSafe,
            threats: result.googleSafeBrowsing.threats || [],
            details: result.googleSafeBrowsing.raw,
            usingBackupKey: result.googleSafeBrowsing.usingBackupKey,
            remainingQuota: result.googleSafeBrowsing.remainingQuota
          };

      // Handle AbuseIPDB response
      const abuseResponse = 'error' in result.abuseIPDB
        ? {
            isSafe: true,
            confidenceScore: 0,
            totalReports: 0,
            countryCode: 'N/A',
            ipAddress: 'N/A',
            isWhitelisted: false,
            usingBackupKey: false,
            remainingQuota: 0
          }
        : {
            isSafe: result.abuseIPDB.isSafe,
            confidenceScore: result.abuseIPDB.confidenceScore,
            totalReports: result.abuseIPDB.totalReports,
            countryCode: result.abuseIPDB.countryCode,
            ipAddress: result.abuseIPDB.ipAddress,
            lastReported: result.abuseIPDB.lastReported,
            isWhitelisted: result.abuseIPDB.isWhitelisted,
            usingBackupKey: result.abuseIPDB.usingBackupKey,
            remainingQuota: result.abuseIPDB.remainingQuota
          };

      setScanResult({
        virusTotal: vtResponse,
        googleSafeBrowsing: gsbResponse,
        abuseIPDB: abuseResponse,
        yandexSafe: result.yandexSafe,
        webOfTrust: result.webOfTrust,
        cleanBrowsing: result.cleanBrowsing
      });
    } catch (error) {
      console.error('Error scanning URL:', error)
      toast.error('Failed to scan URL. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Shield
            sx={{
              fontSize: 80,
              mb: 2,
              color: 'primary.main',
              filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.3))',
            }}
          />
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{
              background: 'linear-gradient(45deg, #6366f1 30%, #22d3ee 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 1,
              fontWeight: 'bold',
              filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.2))',
            }}
          >
            URL Security Scanner
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 500 }}
          >
            Check any URL for potential security threats using multiple scanning services
          </Typography>

          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              background: (theme) =>
                `linear-gradient(${alpha(theme.palette.background.paper, 0.8)}, ${alpha(
                  theme.palette.background.paper,
                  0.8
                )})`,
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              boxShadow: '0 0 20px rgba(0,0,0,0.2)',
              width: '100%',
            }}
          >
            <Box sx={{
              display: 'flex',
              gap: 1,
              width: '100%',
              margin: 0,
              '& .MuiTextField-root': {
                flex: 1,
              }
            }}>
              <TextField
                fullWidth
                label="Enter URL to scan"
                variant="outlined"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handlePaste} size="small" sx={{ mr: 0.5 }}>
                      <ContentPaste />
                    </IconButton>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.6),
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleScan}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Security />}
                sx={{
                  minWidth: 130,
                  background: 'linear-gradient(45deg, #6366f1 30%, #22d3ee 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #4f46e5 30%, #0891b2 90%)',
                  },
                  boxShadow: '0 3px 10px rgba(99, 102, 241, 0.2)',
                }}
              >
                {loading ? 'Scanning...' : 'Scan URL'}
              </Button>
            </Box>

            <Box sx={{ mt: 3, width: '100%' }}>
              {scanResult && (
                <Box sx={{ 
                  mt: 3, 
                  width: '100%', 
                  fontFamily: '"Roboto Mono", monospace',
                  letterSpacing: 0.5,
                  borderRadius: '8px',
                  p: 3
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* VirusTotal Section */}
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(255, 107, 107, 0.1)',
                      borderLeft: '4px solid #FF6B6B',
                      borderRadius: '4px'
                    }}>
                      <Typography sx={{ fontSize: '0.95rem', color: '#FF6B6B', mb: 1 }}>
                        VirusTotal Scan
                      </Typography>
                      <Typography sx={{ fontSize: '0.95rem', color: '#E0E0E0' }}>
                        Detections: {' '}
                        <span style={{ color: scanResult.virusTotal.positives > 0 ? '#FF4444' : '#4CAF50' }}>
                          {scanResult.virusTotal.positives} / {scanResult.virusTotal.total}
                        </span>
                        <span style={{ color: '#6C757D', marginLeft: '8px' }}>
                          [{scanResult.virusTotal.remainingQuota}]
                        </span>
                      </Typography>
                    </Box>

                    {/* Google Safe Browsing Section */}
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(78, 205, 196, 0.1)',
                      borderLeft: '4px solid #4ECDC4',
                      borderRadius: '4px'
                    }}>
                      <Typography sx={{ fontSize: '0.95rem', color: '#4ECDC4', mb: 1 }}>
                        Google Safe Browsing
                      </Typography>
                      <Typography sx={{ fontSize: '0.95rem', color: '#E0E0E0' }}>
                        Status: {' '}
                        <span style={{ color: scanResult.googleSafeBrowsing.isSafe ? '#4CAF50' : '#FF4444' }}>
                          {scanResult.googleSafeBrowsing.isSafe ? 'Safe' : 'Threats Detected'}
                        </span>
                        <span style={{ color: '#6C757D', marginLeft: '8px' }}>
                          [{scanResult.googleSafeBrowsing.remainingQuota}]
                        </span>
                      </Typography>
                      {scanResult.googleSafeBrowsing.threats && scanResult.googleSafeBrowsing.threats.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {scanResult.googleSafeBrowsing.threats.map(threat => (
                            <Typography key={threat} sx={{ color: '#FF6B6B', fontSize: '0.85rem', ml: 2 }}>
                              • {threat}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </Box>

                    {/* AbuseIPDB Section */}
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(255, 217, 61, 0.1)',
                      borderLeft: '4px solid #FFD93D',
                      borderRadius: '4px'
                    }}>
                      <Typography sx={{ fontSize: '0.95rem', color: '#FFD93D', mb: 1 }}>
                        AbuseIPDB Check
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.95rem', color: '#E0E0E0' }}>
                          IP: {scanResult.abuseIPDB.ipAddress || 'N/A'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.95rem', color: '#E0E0E0' }}>
                          Confidence Score: {' '}
                          <span style={{ color: scanResult.abuseIPDB.confidenceScore > 50 ? '#FF4444' : '#4CAF50' }}>
                            {scanResult.abuseIPDB.confidenceScore}%
                          </span>
                        </Typography>
                        <Typography sx={{ fontSize: '0.95rem', color: '#E0E0E0' }}>
                          Country: {scanResult.abuseIPDB.countryCode || 'N/A'} {' '}
                          Reports: {' '}
                          <span style={{ color: scanResult.abuseIPDB.totalReports > 0 ? '#FF4444' : '#4CAF50' }}>
                            {scanResult.abuseIPDB.totalReports}
                          </span>
                          <span style={{ color: '#6C757D', marginLeft: '8px' }}>
                            [{scanResult.abuseIPDB.remainingQuota}]
                          </span>
                        </Typography>
                      </Box>
                    </Box>

                    {/* Additional Security Checks Section */}
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(149, 165, 166, 0.1)',
                      borderLeft: '4px solid #95A5A6',
                      borderRadius: '4px'
                    }}>
                      <Typography sx={{ fontSize: '0.95rem', color: '#95A5A6', mb: 1 }}>
                        Additional Security Checks
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.95rem', color: '#E0E0E0' }}>
                          Yandex Safe Browsing: {' '}
                          <span style={{ color: scanResult.yandexSafe?.isSafe ? '#4CAF50' : '#FF4444' }}>
                            {scanResult.yandexSafe?.isSafe ? 'Safe' : 'Unsafe'}
                          </span>
                        </Typography>
                        <Typography sx={{ fontSize: '0.95rem', color: '#E0E0E0' }}>
                          Web of Trust: {' '}
                          <span style={{ color: scanResult.webOfTrust?.isSafe ? '#4CAF50' : '#FF4444' }}>
                            {scanResult.webOfTrust?.isSafe ? 'Safe' : 'Unsafe'}
                          </span>
                        </Typography>
                        <Typography sx={{ fontSize: '0.95rem', color: '#E0E0E0' }}>
                          Clean Browsing: {' '}
                          <span style={{ color: scanResult.cleanBrowsing?.isSafe ? '#4CAF50' : '#FF4444' }}>
                            {scanResult.cleanBrowsing?.isSafe ? 'Safe' : 'Unsafe'}
                          </span>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  )
}
