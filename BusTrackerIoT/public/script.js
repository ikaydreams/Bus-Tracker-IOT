// Global variables
let socket = null;
let isConnected = false;
let currentBusData = {
    position: [0, 0],
    speed: 0,
    timestamp: null,
    connected: false
};

// DOM elements
const connectionStatus = document.getElementById('connectionStatus');
const currentLocation = document.getElementById('currentLocation');
const currentSpeed = document.getElementById('currentSpeed');
const lastUpdate = document.getElementById('lastUpdate');
const deviceStatus = document.getElementById('deviceStatus');
const loadingOverlay = document.getElementById('loadingOverlay');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');
const closeErrorModal = document.getElementById('closeErrorModal');
const retryConnection = document.getElementById('retryConnection');

// Initialize application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Bus Tracker initializing...');
    
    // Initialize authentication first
    if (typeof window.Auth !== 'undefined') {
        await window.Auth.initAuth();
        
        // Initialize tracking features after auth check
        // The Auth system will show appropriate UI (landing page or dashboard)
        setTimeout(() => {
            // Only initialize if user is authenticated and components exist
            if (window.Auth.isAuthenticated()) {
                if (typeof initializeMap === 'function') {
                    initializeMap();
                }
                
                if (typeof initializeChatbot === 'function') {
                    initializeChatbot();
                }
                
                // Connect to WebSocket
                connectWebSocket();
                
                // Setup event listeners
                setupEventListeners();
            }
        }, 100); // Small delay to ensure DOM is updated
    } else {
        // Fallback if auth is not available
        console.warn('Authentication not available, loading public interface');
        setTimeout(() => {
            if (typeof initializeMap === 'function') {
                initializeMap();
            }
            if (typeof initializeChatbot === 'function') {
                initializeChatbot();
            }
            connectWebSocket();
            setupEventListeners();
        }, 100);
    }
    
    // Hide loading overlay after initialization
    setTimeout(() => {
        hideLoading();
    }, 2000);
});

// WebSocket connection
function connectWebSocket() {
    try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        console.log('Connecting to WebSocket:', wsUrl);
        socket = new WebSocket(wsUrl);
        
        socket.onopen = function(event) {
            console.log('WebSocket connected successfully');
            isConnected = true;
            updateConnectionStatus(true);
        };
        
        socket.onmessage = function(event) {
            try {
                const message = JSON.parse(event.data);
                handleWebSocketMessage(message);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
        
        socket.onclose = function(event) {
            console.log('WebSocket connection closed');
            isConnected = false;
            updateConnectionStatus(false);
            
            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                if (!isConnected) {
                    console.log('Attempting to reconnect...');
                    connectWebSocket();
                }
            }, 5000);
        };
        
        socket.onerror = function(error) {
            console.error('WebSocket error:', error);
            showError('WebSocket connection failed. Please check your network connection.');
            isConnected = false;
            updateConnectionStatus(false);
        };
        
    } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        showError('Failed to establish connection to the tracking server.');
    }
}

// Handle WebSocket messages
function handleWebSocketMessage(message) {
    console.log('Received message:', message);
    
    switch (message.type) {
        case 'INITIAL_DATA':
            currentBusData = message.data;
            updateUI(currentBusData);
            break;
            
        case 'POSITION_UPDATE':
            currentBusData = message.data;
            updateUI(currentBusData);
            // Update map if function exists
            if (typeof updateMapPosition === 'function') {
                updateMapPosition(currentBusData.position, currentBusData.speed);
            }
            break;
            
        case 'CONNECTION_STATUS':
            currentBusData.connected = message.data.connected;
            updateDeviceStatus(currentBusData.connected);
            break;
            
        default:
            console.log('Unknown message type:', message.type);
    }
}

// Update UI with bus data
function updateUI(data) {
    // Update location
    if (data.position && data.position[0] !== 0 && data.position[1] !== 0) {
        currentLocation.textContent = `${data.position[0].toFixed(6)}, ${data.position[1].toFixed(6)}`;
    } else {
        currentLocation.textContent = 'Waiting for GPS...';
    }
    
    // Update speed
    currentSpeed.textContent = `${data.speed || 0} km/h`;
    
    // Update timestamp
    if (data.timestamp) {
        const updateTime = new Date(data.timestamp);
        lastUpdate.textContent = formatTime(updateTime);
    }
    
    // Update device status
    updateDeviceStatus(data.connected);
}

// Update connection status
function updateConnectionStatus(connected) {
    if (connected) {
        connectionStatus.className = 'connection-status connected';
        connectionStatus.innerHTML = '<i class="fas fa-circle"></i><span>Connected</span>';
    } else {
        connectionStatus.className = 'connection-status disconnected';
        connectionStatus.innerHTML = '<i class="fas fa-circle"></i><span>Disconnected</span>';
    }
}

// Update device status
function updateDeviceStatus(connected) {
    if (connected) {
        deviceStatus.textContent = 'Online';
        deviceStatus.parentElement.parentElement.style.borderLeft = '4px solid #27ae60';
    } else {
        deviceStatus.textContent = 'Offline';
        deviceStatus.parentElement.parentElement.style.borderLeft = '4px solid #e74c3c';
    }
}

// Format time for display
function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // Less than 1 minute
        return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
        const minutes = Math.floor(diff / 60000);
        return `${minutes} min ago`;
    } else {
        return date.toLocaleTimeString();
    }
}

// Show error modal
function showError(message) {
    errorMessage.textContent = message;
    errorModal.style.display = 'block';
}

// Hide error modal
function hideError() {
    errorModal.style.display = 'none';
}

// Show loading overlay
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Setup event listeners
function setupEventListeners() {
    // Error modal close
    closeErrorModal.addEventListener('click', hideError);
    
    // Retry connection
    retryConnection.addEventListener('click', function() {
        hideError();
        showLoading();
        connectWebSocket();
        setTimeout(hideLoading, 3000);
    });
    
    // Center map button
    const centerMapBtn = document.getElementById('centerMapBtn');
    if (centerMapBtn) {
        centerMapBtn.addEventListener('click', function() {
            if (typeof centerMapOnBus === 'function') {
                centerMapOnBus();
            }
        });
    }
    
    // Toggle route button
    const toggleRouteBtn = document.getElementById('toggleRouteBtn');
    if (toggleRouteBtn) {
        toggleRouteBtn.addEventListener('click', function() {
            if (typeof toggleRoute === 'function') {
                toggleRoute();
            }
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === errorModal) {
            hideError();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (typeof resizeMap === 'function') {
            setTimeout(resizeMap, 100);
        }
    });
}

// API call to health check
async function checkServerHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        console.log('Server health:', data);
        return data;
    } catch (error) {
        console.error('Health check failed:', error);
        return null;
    }
}

// Periodic health check
setInterval(async () => {
    if (!isConnected) {
        const health = await checkServerHealth();
        if (health && health.status === 'online') {
            console.log('Server is online, attempting to reconnect WebSocket...');
            connectWebSocket();
        }
    }
}, 30000); // Check every 30 seconds

// Export functions for other modules
window.BusTracker = {
    getCurrentBusData: () => currentBusData,
    isConnected: () => isConnected,
    showError: showError,
    hideError: hideError,
    formatTime: formatTime
};
