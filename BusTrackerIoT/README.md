# Ghana Bus Tracker - IoT Real-time Monitoring System

A complete real-time bus tracking system designed for Ghana's transportation network, featuring IoT GPS tracking, web dashboard, and Google Sheets database integration.

## Features

- **Real-time GPS Tracking**: ESP32-based IoT devices with GPS and GSM connectivity
- **Interactive Web Dashboard**: Live map with Ghana-focused routing
- **Smart Chatbot**: AI assistant for bus status queries with Ghana-specific responses
- **User Authentication**: Session-based login/signup system
- **Google Sheets Database**: Cloud-based data persistence with memory fallback
- **Responsive Design**: Mobile-friendly interface optimized for Ghana users

## Technology Stack

### Backend
- Node.js with Express.js
- WebSocket for real-time communication
- Google Sheets API for data storage
- Session-based authentication

### Frontend
- Vanilla JavaScript (no frameworks)
- Leaflet.js for interactive mapping
- Font Awesome icons
- Responsive CSS with gradient design

### IoT Hardware
- ESP32 microcontroller (Wi-Fi + Bluetooth)
- NEO-6M GPS module
- SIM800L GSM module (2G)
- LM2596 power converter (12V→5V)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
# or
node server.js
```

### 3. Access the Application
Open http://localhost:5000 in your browser

### 4. Demo Accounts
- **Admin**: admin@ghana-bus.com / admin123
- **Driver**: driver@ghana-bus.com / driver123  
- **Demo**: demo@test.com / demo123

## Google Sheets Setup (Optional)

For persistent data storage, configure Google Sheets integration:

1. Follow instructions in `Google_Sheets_Setup.md`
2. Set environment variables:
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_KEY`

Without Google Sheets, the system uses in-memory storage.

## IoT Device Setup

### Hardware Assembly
1. Connect ESP32 to GPS module (pins 16/17)
2. Connect ESP32 to GSM module (pins 18/19)
3. Wire power converter for 12V vehicle power
4. Install antennas for GPS and GSM

### Software Upload
1. Open `ESP32_GPS_Code.ino` in Arduino IDE
2. Configure WiFi credentials and server URL
3. Upload to ESP32 device
4. Mount in vehicle with GPS antenna placement

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - User logout

### Bus Tracking
- `POST /api/update-position` - GPS data from IoT device
- `GET /api/bus-history` - Historical tracking data
- `POST /api/chat` - Chatbot interactions
- `GET /api/health` - System status

## File Structure

```
├── server.js                 # Main server application
├── server/
│   ├── simpleAuth.js         # Authentication system
│   └── googleSheets.js       # Google Sheets integration
├── public/
│   ├── index.html            # Main web interface
│   ├── auth.js               # Frontend authentication
│   ├── map.js                # Leaflet map integration
│   ├── chatbot.js            # Chat interface
│   ├── script.js             # Main application logic
│   └── styles.css            # Responsive styling
├── ESP32_GPS_Code.ino        # IoT device firmware
├── Ghana_Bus_Routes.md       # Route documentation
├── Google_Sheets_Setup.md    # Database setup guide
└── IoT_Setup_Instructions.md # Hardware assembly guide
```

## Ghana-Specific Features

### Supported Routes
- Accra ↔ Kumasi (250km, 3-4 hours)
- Accra ↔ Takoradi (240km, 3.5-4 hours)  
- Accra ↔ Tamale (600km, 8-10 hours)
- Metropolitan Accra routes

### Network Compatibility
- MTN Ghana (recommended)
- Vodafone Ghana
- AirtelTigo Ghana

### Map Coverage
- Centered on Accra (5.6037, -0.1870)
- Ghana road network optimization
- Major city and bus station markers

## Deployment

### Local Development
```bash
npm install
node server.js
```

### Production Deployment
- Configure environment variables
- Set up Google Sheets credentials
- Deploy to cloud platform (Replit, Heroku, etc.)
- Ensure HTTPS for WebSocket connections

## Security Notes

- Passwords stored in plain text (demo only)
- Implement bcrypt hashing for production
- Add rate limiting for API endpoints
- Secure Google Sheets service account keys

## Support

For technical support:
- Check console logs for error messages
- Verify hardware connections for IoT devices
- Test Google Sheets connectivity
- Review API endpoint responses

## License

This project is designed for Ghana's transportation sector. Customize as needed for your specific bus routes and operational requirements.

---

**Ghana Bus Tracker** - Connecting Ghana through intelligent transportation monitoring.