# Bus Tracker - Real-time IoT Monitoring System

## Overview

This is a real-time bus tracking system that combines IoT GPS data collection with web-based visualization. The system receives GPS coordinates from IoT devices (buses), processes the data on a Node.js server, and displays real-time location updates on an interactive web interface with mapping capabilities and a basic chatbot for user queries.

## System Architecture

The application follows a client-server architecture with WebSocket communication for real-time updates:

### Backend Architecture
- **Node.js/Express Server**: Main application server handling HTTP requests and WebSocket connections
- **WebSocket Server**: Real-time bidirectional communication between server and clients
- **REST API**: HTTP endpoints for GPS data ingestion and chatbot interactions
- **In-Memory Storage**: Current bus data stored in server memory (no persistent database)

### Frontend Architecture
- **Static Web Application**: HTML/CSS/JavaScript served from the Express server
- **Interactive Map**: Leaflet.js for GPS visualization and route tracking
- **Real-time Updates**: WebSocket client for live data synchronization
- **Responsive UI**: Modern CSS with cards, status indicators, and mobile-friendly design
- **Basic Chatbot**: Simple rule-based chatbot for user queries

## Key Components

### Server Components (`server.js`)
- **Express HTTP Server**: Serves static files and API endpoints
- **WebSocket Server**: Manages client connections and broadcasts updates
- **GPS Data Handler**: Processes incoming GPS coordinates from IoT devices
- **Client Management**: Tracks connected web clients for data broadcasting

### Frontend Components
- **Map Interface** (`map.js`): Leaflet.js integration for GPS visualization
- **Main Application** (`script.js`): WebSocket client and UI management
- **Chatbot Interface** (`chatbot.js`): Basic conversational interface
- **Responsive Styling** (`styles.css`): Modern UI with gradient backgrounds and cards

### API Endpoints
- `POST /api/update-position`: Receives GPS data from IoT devices
- `POST /api/chat`: Handles chatbot queries
- `GET /*`: Serves static frontend files

## Data Flow

1. **GPS Data Ingestion**: IoT devices POST GPS coordinates to `/api/update-position`
2. **Server Processing**: Server validates and stores current bus position/speed
3. **Real-time Broadcasting**: WebSocket broadcasts updates to all connected clients
4. **Client Updates**: Frontend receives data and updates map markers and UI elements
5. **User Interaction**: Chatbot processes user queries about bus location/ETA

## External Dependencies

### Backend Dependencies
- **express**: Web framework for HTTP server and routing
- **ws**: WebSocket library for real-time communication
- **body-parser**: Middleware for parsing JSON request bodies

### Frontend Dependencies
- **Leaflet.js**: Open-source mapping library for GPS visualization
- **Font Awesome**: Icon library for UI elements
- **OpenStreetMap**: Tile layer provider for map data

## Deployment Strategy

### Replit Configuration
- **Runtime**: Node.js 20 on Nix stable-24_05
- **Port Configuration**: Server runs on port 5000, external access via port 80
- **Workflow**: Automated setup installs dependencies and starts server
- **Static Serving**: Public directory served for frontend assets

### Production Considerations
- Currently uses in-memory storage (data lost on restart)
- No authentication/authorization implemented
- Basic error handling and validation
- Single server instance (no load balancing)

### Scalability Limitations
- In-memory data storage limits horizontal scaling
- No persistent data layer for historical tracking
- WebSocket connections limited by single server capacity

## Recent Changes
- June 25, 2025: Complete IoT bus tracking application built with real-time GPS monitoring
- Implemented Express.js server with WebSocket support for live data streaming
- Created responsive web interface with interactive Leaflet map
- Built intelligent chatbot for bus status queries
- Added automatic connection monitoring and reconnection
- Configured proper port binding (5000) for Replit deployment
- Successfully tested GPS data ingestion and real-time updates
- Updated map default location to Ghana (Accra: 5.6037, -0.1870)
- Added Ghana-specific bus routes and testing coordinates
- Created comprehensive Ghana bus network documentation
- Implemented complete authentication system with login/signup forms
- Added session-based user management with protected API endpoints
- Created demo accounts for testing (admin, driver, demo users)
- Built responsive landing page for unauthenticated users
- Added user profiles with avatars and personalized dashboard
- Replaced database with Google Sheets integration for data persistence
- Added automatic data logging for GPS tracking and chat history
- Implemented fallback to memory storage when Google Sheets unavailable
- Created comprehensive Google Sheets setup documentation
- Fixed chatbot initialization and authentication error handling
- Enhanced chatbot with intelligent responses, emojis, and Ghana-specific information
- Improved error handling for missing DOM elements during auth transitions
- Added proper timing for component initialization after UI updates

## Changelog
- June 25, 2025: Initial setup and complete application development

## User Preferences

Preferred communication style: Simple, everyday language.