# URL Scanner Web Application

## Overview
URL Scanner is a comprehensive web application designed to assess the safety and reputation of URLs by leveraging multiple security APIs. The application provides a user-friendly interface for scanning URLs and aggregates results from various trusted security services.

## Features
- Multi-service URL scanning
- Real-time threat detection
- Comprehensive security reports
- Modern, responsive UI
- Detailed error reporting and logging

## Security Services Integration
The application integrates with several security services:

### 1. VirusTotal
- Scans URLs against 70+ antivirus engines
- Provides detailed malware analysis
- Uses the VirusTotal API v3
- Features include:
  - Existing analysis check
  - New URL submission
  - Real-time result polling

### 2. AbuseIPDB
- Checks domain reputation
- IP address blacklist verification
- Features include:
  - Domain to IP resolution
  - Abuse confidence scoring
  - Historical report analysis

### 3. Yandex Safe Browsing
- Malware detection
- Phishing site identification
- Social engineering threat detection

### 4. Web of Trust (WOT)
- Community-driven website reputation
- Category-based threat assessment
- Trust scoring system

## Technical Architecture

### Frontend (React)
- Built with React and TypeScript
- Features:
  - Component-based architecture
  - Real-time UI updates
  - Error handling and display
  - Progress indicators
- Key components:
  - URLScanner: Main scanning interface
  - ResultsDisplay: Displays scan results
  - ErrorHandler: Manages error states

### Backend (Express)
- Node.js with Express framework
- Features:
  - RESTful API endpoints
  - Rate limiting
  - CORS support
  - Comprehensive error handling
  - Request/Response logging

### API Integration
Each security service is integrated through a dedicated endpoint:
```
POST /api/virustotal
POST /api/abuseipdb
POST /api/yandex
POST /api/wot
```

### Environment Configuration
Required environment variables:
```
VT_API_KEY=your_virustotal_api_key
ABUSE_API_KEY=your_abuseipdb_api_key
PORT=3002
```

## Setup Guide

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- API keys for:
  - VirusTotal
  - AbuseIPDB

### Installation Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd url-scanner-web
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

3. Configure environment variables:
```bash
# In backend/.env
VT_API_KEY=your_virustotal_api_key
ABUSE_API_KEY=your_abuseipdb_api_key
PORT=3002
```

4. Start the application:
```bash
# Start backend server
cd backend
node server.js

# Start frontend development server
cd ..
npm run dev
```

## API Documentation

### VirusTotal Endpoint
```
POST /api/virustotal
Body: { "url": "https://example.com" }
```

### AbuseIPDB Endpoint
```
POST /api/abuseipdb
Body: { "url": "https://example.com" }
```

### Yandex Safe Browsing Endpoint
```
POST /api/yandex
Body: { "url": "https://example.com" }
```

### WOT Endpoint
```
POST /api/wot
Body: { "url": "https://example.com" }
```

## Error Handling
The application implements comprehensive error handling:
- Frontend: Displays user-friendly error messages
- Backend: Detailed error logging and appropriate status codes
- API Integration: Timeout handling and retry logic

## Security Considerations
- API keys stored securely in environment variables
- CORS configuration to prevent unauthorized access
- Rate limiting to prevent abuse
- Input validation for URL scanning
- Secure error handling to prevent information leakage

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Implement proper error handling
- Add comments for complex logic
- Use async/await for asynchronous operations

### Testing
- Write unit tests for components
- Test API integrations
- Implement error scenario testing
- Verify CORS and security measures

### Deployment
- Set up proper environment variables
- Configure CORS for production
- Enable SSL/TLS
- Set up monitoring and logging
- Implement rate limiting

## Troubleshooting

### Common Issues
1. API Connection Errors
   - Verify API keys
   - Check network connectivity
   - Confirm rate limits

2. CORS Issues
   - Verify CORS configuration
   - Check allowed origins
   - Confirm request headers

3. Timeout Errors
   - Check API service status
   - Verify network latency
   - Adjust timeout settings

### Debug Mode
Enable detailed logging by setting:
```javascript
// In backend/server.js
const DEBUG = true;
```

## Future Enhancements
- Additional security API integrations
- Enhanced result visualization
- Batch URL scanning
- Historical scan results
- User authentication
- Custom scanning profiles
- API rate limit monitoring
- Performance optimization

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.
