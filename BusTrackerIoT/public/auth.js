// Authentication utilities for the frontend
let currentUser = null;
let isLoading = true;

// Initialize authentication check
async function initAuth() {
    try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
            currentUser = await response.json();
        } else if (response.status === 401) {
            currentUser = null;
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        currentUser = null;
    } finally {
        isLoading = false;
        updateAuthUI();
    }
}

// Update UI based on authentication state
function updateAuthUI() {
    const app = document.querySelector('.main-content');
    
    if (isLoading) {
        // Show loading state
        return;
    }
    
    if (!currentUser) {
        // Show landing page for unauthenticated users
        showLandingPage();
    } else {
        // Show main app for authenticated users
        showMainApp();
    }
}

// Show landing page for logged out users
function showLandingPage() {
    const app = document.querySelector('.main-content');
    app.innerHTML = `
        <div class="landing-page">
            <div class="landing-content">
                <div class="landing-hero">
                    <h1><i class="fas fa-bus"></i> Ghana Bus Tracker</h1>
                    <p class="hero-subtitle">Real-time IoT-based bus monitoring system</p>
                    <p class="hero-description">
                        Track buses across Ghana in real-time with GPS monitoring, 
                        route visualization, and intelligent status updates.
                    </p>
                </div>
                
                <div class="feature-grid">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <h3>Real-time Tracking</h3>
                        <p>Live GPS monitoring of bus locations across Ghana's major routes</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-route"></i>
                        </div>
                        <h3>Route Visualization</h3>
                        <p>Interactive maps showing bus routes from Accra to Kumasi, Takoradi and more</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-robot"></i>
                        </div>
                        <h3>Smart Assistant</h3>
                        <p>AI chatbot for instant bus status, location, and ETA information</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-mobile-alt"></i>
                        </div>
                        <h3>IoT Integration</h3>
                        <p>ESP32-powered GPS devices with GSM connectivity for reliable tracking</p>
                    </div>
                </div>
                
                <div class="auth-section">
                    <h2>Get Started</h2>
                    <p>Sign in to access the bus tracking dashboard and start monitoring your routes.</p>
                    
                    <!-- Login Form -->
                    <div id="loginForm" class="auth-form">
                        <h3>Sign In</h3>
                        <div class="form-group">
                            <input type="email" id="loginEmail" placeholder="Email" required>
                        </div>
                        <div class="form-group">
                            <input type="password" id="loginPassword" placeholder="Password" required>
                        </div>
                        <button onclick="login()" class="btn btn-primary btn-large">
                            <i class="fas fa-sign-in-alt"></i> Sign In
                        </button>
                        <p class="form-switch">
                            Don't have an account? <a href="#" onclick="showSignupForm()">Sign up here</a>
                        </p>
                    </div>

                    <!-- Signup Form -->
                    <div id="signupForm" class="auth-form" style="display: none;">
                        <h3>Create Account</h3>
                        <div class="form-group">
                            <input type="text" id="signupFirstName" placeholder="First Name">
                        </div>
                        <div class="form-group">
                            <input type="text" id="signupLastName" placeholder="Last Name">
                        </div>
                        <div class="form-group">
                            <input type="email" id="signupEmail" placeholder="Email" required>
                        </div>
                        <div class="form-group">
                            <input type="password" id="signupPassword" placeholder="Password" required>
                        </div>
                        <button onclick="signup()" class="btn btn-primary btn-large">
                            <i class="fas fa-user-plus"></i> Create Account
                        </button>
                        <p class="form-switch">
                            Already have an account? <a href="#" onclick="showLoginForm()">Sign in here</a>
                        </p>
                    </div>

                    <!-- Demo Credentials -->
                    <div class="demo-credentials">
                        <h4>Demo Accounts</h4>
                        <div class="demo-account">
                            <strong>Admin:</strong> admin@ghana-bus.com / admin123
                        </div>
                        <div class="demo-account">
                            <strong>Driver:</strong> driver@ghana-bus.com / driver123
                        </div>
                        <div class="demo-account">
                            <strong>Demo:</strong> demo@test.com / demo123
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add landing page styles
    addLandingPageStyles();
}

// Show main application for authenticated users
function showMainApp() {
    const app = document.querySelector('.main-content');
    app.innerHTML = `
        <!-- Control Panel -->
        <div class="control-panel">
            <div class="user-info">
                <div class="user-profile">
                    <img src="${currentUser.profileImageUrl || '/default-avatar.png'}" alt="Profile" class="user-avatar" style="object-fit: cover;">
                    <div class="user-details">
                        <h3>Welcome, ${currentUser.firstName || currentUser.email}!</h3>
                        <p>Bus tracking dashboard</p>
                    </div>
                </div>
                <button onclick="logout()" class="btn btn-secondary">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
            
            <div class="info-cards">
                <div class="info-card">
                    <div class="card-icon">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div class="card-content">
                        <h3>Current Location</h3>
                        <p id="currentLocation">Waiting for GPS...</p>
                    </div>
                </div>
                
                <div class="info-card">
                    <div class="card-icon">
                        <i class="fas fa-tachometer-alt"></i>
                    </div>
                    <div class="card-content">
                        <h3>Speed</h3>
                        <p id="currentSpeed">0 km/h</p>
                    </div>
                </div>
                
                <div class="info-card">
                    <div class="card-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="card-content">
                        <h3>Last Update</h3>
                        <p id="lastUpdate">Never</p>
                    </div>
                </div>
                
                <div class="info-card">
                    <div class="card-icon">
                        <i class="fas fa-wifi"></i>
                    </div>
                    <div class="card-content">
                        <h3>Device Status</h3>
                        <p id="deviceStatus">Offline</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Map and Chat Layout -->
        <div class="content-layout">
            <!-- Map Container -->
            <div class="map-container">
                <div class="map-header">
                    <h2><i class="fas fa-map"></i> Live Tracking Map</h2>
                    <div class="map-controls">
                        <button id="centerMapBtn" class="btn btn-secondary" title="Center on Bus">
                            <i class="fas fa-crosshairs"></i>
                        </button>
                        <button id="toggleRouteBtn" class="btn btn-secondary" title="Toggle Route">
                            <i class="fas fa-route"></i>
                        </button>
                    </div>
                </div>
                <div id="map" class="map"></div>
            </div>

            <!-- Chat Container -->
            <div class="chat-container">
                <div class="chat-header">
                    <h2><i class="fas fa-robot"></i> Bus Assistant</h2>
                    <button id="clearChatBtn" class="btn btn-secondary btn-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div id="chatMessages" class="chat-messages">
                    <div class="message bot-message">
                        <div class="message-content">
                            <p>Hello ${currentUser.firstName || 'there'}! I'm your bus tracking assistant. Ask me about the bus location, speed, or status.</p>
                        </div>
                        <div class="message-time"></div>
                    </div>
                </div>
                <div class="chat-input-container">
                    <input type="text" id="chatInput" placeholder="Ask about bus location, speed, ETA..." />
                    <button id="sendChatBtn" class="btn btn-primary">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Reinitialize components after DOM update
    setTimeout(() => {
        if (typeof initializeMap === 'function') {
            initializeMap();
        }
        if (typeof initializeChatbot === 'function') {
            initializeChatbot();
        }
        
        // Setup event listeners for the new DOM elements
        if (typeof setupEventListeners === 'function') {
            setupEventListeners();
        }
        
        // Connect WebSocket for authenticated users
        if (typeof connectWebSocket === 'function') {
            connectWebSocket();
        }
    }, 100);
}

// Authentication functions
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showError('Please enter email and password');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            updateAuthUI();
        } else {
            const error = await response.json();
            showError(error.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please try again.');
    }
}

async function signup() {
    const firstName = document.getElementById('signupFirstName').value;
    const lastName = document.getElementById('signupLastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    if (!email || !password) {
        showError('Please enter email and password');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ firstName, lastName, email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            updateAuthUI();
        } else {
            const error = await response.json();
            showError(error.message || 'Signup failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showError('Network error. Please try again.');
    }
}

async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        currentUser = null;
        updateAuthUI();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
}

function showSignupForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

function showError(message) {
    // Create or update error display
    let errorDiv = document.getElementById('authError');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'authError';
        errorDiv.className = 'auth-error';
        document.querySelector('.auth-section').prepend(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Add landing page specific styles
function addLandingPageStyles() {
    if (document.getElementById('landingStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'landingStyles';
    style.textContent = `
        .landing-page {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .landing-content {
            text-align: center;
        }
        
        .landing-hero {
            margin-bottom: 4rem;
        }
        
        .landing-hero h1 {
            font-size: 3rem;
            color: white;
            margin-bottom: 1rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .hero-subtitle {
            font-size: 1.3rem;
            color: rgba(255,255,255,0.9);
            margin-bottom: 1rem;
        }
        
        .hero-description {
            font-size: 1.1rem;
            color: rgba(255,255,255,0.8);
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
        }
        
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 4rem;
        }
        
        .feature-card {
            background: rgba(255,255,255,0.95);
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
        }
        
        .feature-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #3498db, #2980b9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            color: white;
            font-size: 1.5rem;
        }
        
        .feature-card h3 {
            color: #2c3e50;
            margin-bottom: 1rem;
        }
        
        .feature-card p {
            color: #7f8c8d;
            line-height: 1.5;
        }
        
        .auth-section {
            background: rgba(255,255,255,0.95);
            padding: 3rem;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        
        .auth-section h2 {
            color: #2c3e50;
            margin-bottom: 1rem;
        }
        
        .auth-section p {
            color: #7f8c8d;
            margin-bottom: 2rem;
        }
        
        .btn-large {
            padding: 1rem 2rem;
            font-size: 1.1rem;
        }
        
        .auth-form {
            max-width: 400px;
            margin: 0 auto;
            text-align: left;
        }
        
        .auth-form h3 {
            text-align: center;
            margin-bottom: 1.5rem;
            color: #2c3e50;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-group input {
            width: 100%;
            padding: 0.8rem;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 1rem;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #3498db;
            box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
        
        .form-switch {
            text-align: center;
            margin-top: 1rem;
            color: #7f8c8d;
        }
        
        .form-switch a {
            color: #3498db;
            text-decoration: none;
        }
        
        .form-switch a:hover {
            text-decoration: underline;
        }
        
        .demo-credentials {
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(52, 152, 219, 0.1);
            border-radius: 6px;
            border: 1px solid rgba(52, 152, 219, 0.2);
        }
        
        .demo-credentials h4 {
            margin-bottom: 0.5rem;
            color: #2c3e50;
        }
        
        .demo-account {
            margin: 0.5rem 0;
            font-size: 0.9rem;
            color: #555;
        }
        
        .auth-error {
            background: #e74c3c;
            color: white;
            padding: 0.8rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            text-align: center;
        }
        
        .user-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255,255,255,0.95);
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        
        .user-profile {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .user-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 3px solid #3498db;
        }
        
        .user-details h3 {
            margin: 0;
            color: #2c3e50;
        }
        
        .user-details p {
            margin: 0;
            color: #7f8c8d;
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .landing-hero h1 {
                font-size: 2rem;
            }
            
            .feature-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .user-info {
                flex-direction: column;
                gap: 1rem;
                text-align: center;
            }
        }
    `;
    document.head.appendChild(style);
}

// Handle unauthorized API responses
function handleUnauthorizedError(error) {
    if (error.message && error.message.includes('401')) {
        // User is not authenticated, show login form
        currentUser = null;
        updateAuthUI();
        return true;
    }
    return false;
}

// Export auth utilities
window.Auth = {
    initAuth,
    login,
    logout,
    getCurrentUser: () => currentUser,
    isAuthenticated: () => !!currentUser,
    isLoading: () => isLoading,
    handleUnauthorizedError
};