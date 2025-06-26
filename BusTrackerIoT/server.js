const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const { setupSimpleAuth, requireAuth, createDemoUsers, db } = require('./server/simpleAuth');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

app.use(bodyParser.json());
app.use(express.static('public'));

// Store connected clients and bus data
const clients = new Set();
let currentBusData = {
    position: [0, 0],
    speed: 0,
    timestamp: null,
    connected: false
};

// WebSocket Connection
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    clients.add(ws);
    
    // Send current bus data to new client
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'INITIAL_DATA',
            data: currentBusData
        }));
    }
    
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});

// GPS Data Endpoint - moved to startServer function with authentication

// Chatbot Endpoint - protected
app.post('/api/chat', requireAuth, async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }
    
    try {
        const response = processChatQuery(query);
        
        // Save chat history to Google Sheets
        try {
            await db.saveChatHistory(req.session.userId, query, response);
        } catch (error) {
            console.error('Failed to save chat history:', error.message);
        }
        
        res.json({ response });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ error: 'Chatbot service unavailable' });
    }
});

// Enhanced Chatbot Logic
function processChatQuery(query) {
    if (!query || typeof query !== 'string') {
        return "Please ask me something about the bus tracking system.";
    }
    
    const queryLower = query.toLowerCase().trim();
    
    // Greeting responses
    if (queryLower.match(/^(hi|hello|hey|good morning|good afternoon|good evening)$/)) {
        return "Hello! I'm your Ghana Bus Tracker assistant. I can help you with bus location, speed, and status information. What would you like to know?";
    }
    
    // Location queries
    if (queryLower.match(/location|where|position|coordinates/)) {
        if (currentBusData.connected && currentBusData.position[0] !== 0) {
            const lat = currentBusData.position[0].toFixed(6);
            const lng = currentBusData.position[1].toFixed(6);
            return `🚌 The bus is currently at coordinates: ${lat}, ${lng}\n\nThis location is in Ghana. You can see the exact position on the map above.`;
        }
        return "❌ Bus location is not available at the moment. Please check if the GPS device is connected and sending data.";
    }
    
    // Speed queries
    if (queryLower.match(/speed|fast|velocity|moving/)) {
        if (currentBusData.connected) {
            const speed = currentBusData.speed || 0;
            if (speed === 0) {
                return `🚌 The bus is currently stopped (0 km/h). It may be at a bus stop or in traffic.`;
            } else if (speed < 20) {
                return `🚌 The bus is moving slowly at ${speed} km/h. It might be in city traffic or approaching a stop.`;
            } else if (speed < 60) {
                return `🚌 The bus is traveling at ${speed} km/h. Normal city driving speed.`;
            } else {
                return `🚌 The bus is traveling at ${speed} km/h. Highway speed - likely on a long-distance route.`;
            }
        }
        return "❌ Speed information is not available. Please check the GPS connection.";
    }
    
    // ETA and time queries
    if (queryLower.match(/eta|time|arrive|when|how long/)) {
        return "⏱️ ETA calculation requires destination information. This feature will be available in future updates. For now, you can track the bus location in real-time on the map.";
    }
    
    // Status queries
    if (queryLower.match(/status|connect|online|working/)) {
        const statusMsg = currentBusData.connected ? 
            "✅ The bus tracking device is online and sending data." : 
            "❌ The bus tracking device appears to be offline.";
        
        const lastUpdate = currentBusData.timestamp ? 
            `\n\nLast update: ${new Date(currentBusData.timestamp).toLocaleString()}` : 
            "\n\nNo recent updates received.";
            
        return statusMsg + lastUpdate;
    }
    
    // Route information
    if (queryLower.match(/route|destination|going|direction/)) {
        return "🗺️ Route information is not available yet. The system currently tracks real-time location. Popular Ghana routes include:\n• Accra ↔ Kumasi\n• Accra ↔ Takoradi\n• Accra ↔ Tamale";
    }
    
    // Help queries
    if (queryLower.match(/help|what|can|commands|options/)) {
        return "🤖 I can help you with:\n\n📍 Current bus location\n🚌 Bus speed and movement\n📶 Device connection status\n🗺️ General tracking information\n\nTry asking:\n• 'Where is the bus?'\n• 'What's the current speed?'\n• 'Is the device online?'";
    }
    
    // Ghana-specific queries
    if (queryLower.match(/ghana|accra|kumasi|takoradi|tamale/)) {
        return "🇬🇭 This bus tracker is designed for Ghana's transportation network. The system covers major routes including Accra-Kumasi, Accra-Takoradi, and other intercity connections across Ghana.";
    }
    
    // Default response with suggestions
    return "🤔 I'm not sure about that. I can help with:\n\n📍 Bus location and coordinates\n🚌 Speed and movement status\n📶 Device connectivity\n\nTry asking 'Where is the bus?' or 'What's the current speed?'";
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        busConnected: currentBusData.connected,
        activeClients: clients.size,
        database: db.initialized ? 'Google Sheets' : 'Memory'
    });
});

// Bus history endpoint
app.get('/api/bus-history', requireAuth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const history = await db.getBusHistory(limit);
        res.json(history);
    } catch (error) {
        console.error('Error fetching bus history:', error);
        res.status(500).json({ error: 'Failed to fetch bus history' });
    }
});

// Simulate connection timeout (mark as disconnected if no updates for 30 seconds)
setInterval(() => {
    if (currentBusData.timestamp) {
        const lastUpdate = new Date(currentBusData.timestamp);
        const now = new Date();
        const timeDiff = now - lastUpdate;
        
        if (timeDiff > 30000 && currentBusData.connected) { // 30 seconds
            currentBusData.connected = false;
            console.log('Bus marked as disconnected due to timeout');
            
            // Notify all clients
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'CONNECTION_STATUS',
                        data: { connected: false }
                    }));
                }
            });
        }
    }
}, 5000); // Check every 5 seconds

// Setup authentication and database
async function initializeApp() {
    await setupSimpleAuth(app);
    await createDemoUsers();
    console.log('Application initialized with Google Sheets database');
}

initializeApp();

// Protect bus tracking endpoints
app.post('/api/update-position', requireAuth, async (req, res) => {
    const { lat, lng, speed } = req.body;

    // Validate input data
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Update current bus data
    currentBusData = {
        position: [lat, lng],
        speed: speed || 0,
        timestamp: new Date().toISOString(),
        connected: true
    };

    console.log('Position update:', currentBusData);

    // Save to Google Sheets database
    try {
        await db.saveBusData(currentBusData, req.session.userId);
    } catch (error) {
        console.error('Failed to save bus data to database:', error.message);
    }

    // Broadcast to all clients
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'POSITION_UPDATE',
                data: currentBusData
            }));
        }
    });

    res.status(200).json({ success: true });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Bus tracking server running on port ${PORT}`);
    console.log(`WebSocket server available at ws://localhost:${PORT}/ws`);
    console.log('Authentication enabled - users must log in to access tracking features');
});
