// Simple authentication system for the bus tracker
const session = require('express-session');
const { GoogleSheetsDB } = require('./googleSheets');

const db = new GoogleSheetsDB();

// Simple session-based authentication
async function setupSimpleAuth(app) {
    // Initialize Google Sheets database
    await db.initialize();
    // Session configuration
    app.use(session({
        secret: process.env.SESSION_SECRET || 'ghana-bus-tracker-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set to true in production with HTTPS
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    }));

    // Login endpoint
    app.post('/api/auth/login', async (req, res) => {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        try {
            const user = await db.getUserByEmail(email);
            if (user && user.password === password) {
                req.session.userId = user.id;
                req.session.user = {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profileImageUrl: user.profileImageUrl
                };
                res.json({ user: req.session.user });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login' });
        }
    });

    // Signup endpoint
    app.post('/api/auth/signup', async (req, res) => {
        const { email, password, firstName, lastName } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        try {
            const existingUser = await db.getUserByEmail(email);
            if (existingUser) {
                return res.status(409).json({ message: 'User already exists' });
            }

            // Create new user
            const userData = {
                email,
                password, // In production, hash this password
                firstName: firstName || '',
                lastName: lastName || '',
                profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent((firstName || '') + ' ' + (lastName || ''))}&background=3498db&color=fff`
            };

            const user = await db.createUser(userData);
            
            // Auto-login after signup
            req.session.userId = user.id;
            req.session.user = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImageUrl: user.profileImageUrl
            };

            res.status(201).json({ user: req.session.user });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ message: 'Server error during signup' });
        }
    });

    // Get current user
    app.get('/api/auth/user', async (req, res) => {
        if (req.session.user) {
            // Optionally refresh user data from database
            try {
                const user = await db.getUserById(req.session.userId);
                if (user) {
                    req.session.user = user;
                    res.json(user);
                } else {
                    res.json(req.session.user);
                }
            } catch (error) {
                res.json(req.session.user);
            }
        } else {
            res.status(401).json({ message: 'Not authenticated' });
        }
    });

    // Logout endpoint
    app.post('/api/auth/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Could not log out' });
            }
            res.json({ message: 'Logged out successfully' });
        });
    });
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ message: 'Authentication required' });
}

// Create demo users
async function createDemoUsers() {
    const demoUsers = [
        {
            email: 'admin@ghana-bus.com',
            password: 'admin123',
            firstName: 'Admin',
            lastName: 'User',
            profileImageUrl: 'https://ui-avatars.com/api/?name=Admin+User&background=e74c3c&color=fff'
        },
        {
            email: 'driver@ghana-bus.com',
            password: 'driver123',
            firstName: 'Bus',
            lastName: 'Driver',
            profileImageUrl: 'https://ui-avatars.com/api/?name=Bus+Driver&background=27ae60&color=fff'
        },
        {
            email: 'demo@test.com',
            password: 'demo123',
            firstName: 'Demo',
            lastName: 'User',
            profileImageUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=3498db&color=fff'
        }
    ];

    for (const userData of demoUsers) {
        try {
            const existingUser = await db.getUserByEmail(userData.email);
            if (!existingUser) {
                await db.createUser(userData);
            }
        } catch (error) {
            console.error(`Error creating demo user ${userData.email}:`, error.message);
        }
    }

    console.log('Demo users ready:');
    console.log('- admin@ghana-bus.com / admin123');
    console.log('- driver@ghana-bus.com / driver123');
    console.log('- demo@test.com / demo123');
}

module.exports = { setupSimpleAuth, requireAuth, createDemoUsers, db };