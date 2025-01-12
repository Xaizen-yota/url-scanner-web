import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  Link,
  alpha,
  Paper,
} from '@mui/material'
import {
  Security,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  Language,
  Shield,
} from '@mui/icons-material'

interface ScanResultProps {
  result: {
    url: string
    virusTotal: {
      positives: number
      total: number
    }
    googleSafeBrowsing: {
      isSafe: boolean
      matches: Array<{ threatType: string }>
    }
    urlScan: {
      uuid: string
      result: string
    }
    scan_date: string
  }
}

export function ScanResult({ result }: ScanResultProps) {
  const isUrlSafe =
    result.virusTotal.positives === 0 && result.googleSafeBrowsing.isSafe

  return (
    <Box sx={{ mt: 3, position: 'relative' }}>
      <Paper
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: (theme) =>
            `linear-gradient(${alpha(theme.palette.background.paper, 0.9)}, ${alpha(
              theme.palette.background.paper,
              0.9
            )})`,
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: (theme) =>
              isUrlSafe
                ? 'linear-gradient(90deg, #22c55e 0%, #10b981 100%)'
                : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
          }}
        />

        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 3,
              gap: 2,
            }}
          >
            {isUrlSafe ? (
              <CheckCircle
                sx={{
                  fontSize: 40,
                  color: 'success.main',
                }}
              />
            ) : (
              <Warning
                sx={{
                  fontSize: 40,
                  color: 'error.main',
                }}
              />
            )}
            <Box>
              <Typography variant="h6" gutterBottom>
                {isUrlSafe ? 'URL appears to be safe' : 'Potential security threat detected'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Language fontSize="small" />
                {result.url}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Service Results */}
          <Box sx={{ display: 'grid', gap: 3 }}>
            {/* VirusTotal Results */}
            <ResultSection
              icon={<Shield />}
              title="VirusTotal Analysis"
              content={
                <>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Detection Rate:{' '}
                    <Typography
                      component="span"
                      sx={{
                        color: result.virusTotal.positives > 0 ? 'error.main' : 'success.main',
                        fontWeight: 'bold',
                      }}
                    >
                      {result.virusTotal.positives}/{result.virusTotal.total}
                    </Typography>
                  </Typography>
                  {result.virusTotal.positives > 0 && (
                    <Chip
                      label="Security Threats Found"
                      color="error"
                      size="small"
                      sx={{
                        mt: 1,
                        background: (theme) => alpha(theme.palette.error.main, 0.1),
                      }}
                    />
                  )}
                </>
              }
            />

            {/* Google Safe Browsing Results */}
            <ResultSection
              icon={<Security />}
              title="Google Safe Browsing"
              content={
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {result.googleSafeBrowsing.isSafe ? (
                      <Chip
                        icon={<CheckCircle />}
                        label="Safe"
                        color="success"
                        size="small"
                        sx={{
                          background: (theme) => alpha(theme.palette.success.main, 0.1),
                        }}
                      />
                    ) : (
                      <Chip
                        icon={<ErrorIcon />}
                        label="Threats Detected"
                        color="error"
                        size="small"
                        sx={{
                          background: (theme) => alpha(theme.palette.error.main, 0.1),
                        }}
                      />
                    )}
                  </Box>
                  {result.googleSafeBrowsing.matches.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Detected threats:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {result.googleSafeBrowsing.matches.map((match, index) => (
                          <Chip
                            key={index}
                            label={match.threatType}
                            size="small"
                            sx={{
                              background: (theme) => alpha(theme.palette.error.main, 0.1),
                              color: 'error.main',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              }
            />

            {/* URLScan Results */}
            <ResultSection
              icon={<Language />}
              title="URLScan.io"
              content={
                <Link
                  href={result.urlScan.result}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  View detailed scan results
                </Link>
              }
            />
          </Box>

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 3,
              textAlign: 'right',
              color: 'text.secondary',
            }}
          >
            Scan completed on {new Date(result.scan_date).toLocaleString()}
          </Typography>
        </CardContent>
      </Paper>
    </Box>
  )
}

function ResultSection({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode
  title: string
  content: React.ReactNode
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box
          sx={{
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle1">{title}</Typography>
      </Box>
      {content}
    </Box>
  )
}
