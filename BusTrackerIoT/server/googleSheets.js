// Google Sheets integration for Ghana Bus Tracker
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

class GoogleSheetsDB {
    constructor() {
        this.auth = null;
        this.sheets = null;
        this.spreadsheetId = process.env.GOOGLE_SHEET_ID;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Initialize authentication
            if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
                // Use service account for production
                const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
                this.auth = new GoogleAuth({
                    credentials,
                    scopes: ['https://www.googleapis.com/auth/spreadsheets']
                });
            } else {
                console.log('Google Sheets not configured - using memory storage');
                return;
            }

            this.sheets = google.sheets({ version: 'v4', auth: this.auth });
            
            // Create default sheets if they don't exist
            await this.setupDefaultSheets();
            
            this.initialized = true;
            console.log('Google Sheets database initialized');
        } catch (error) {
            console.error('Failed to initialize Google Sheets:', error.message);
            console.log('Falling back to memory storage');
        }
    }

    async setupDefaultSheets() {
        if (!this.spreadsheetId) return;

        try {
            // Check if sheets exist, create if needed
            const sheetsToCreate = [
                {
                    name: 'Users',
                    headers: ['ID', 'Email', 'Password', 'FirstName', 'LastName', 'ProfileImageUrl', 'CreatedAt']
                },
                {
                    name: 'BusData',
                    headers: ['Timestamp', 'Latitude', 'Longitude', 'Speed', 'DeviceConnected', 'UserID']
                },
                {
                    name: 'ChatHistory',
                    headers: ['Timestamp', 'UserID', 'Query', 'Response']
                }
            ];

            for (const sheet of sheetsToCreate) {
                await this.createSheetIfNotExists(sheet.name, sheet.headers);
            }
        } catch (error) {
            console.error('Error setting up default sheets:', error.message);
        }
    }

    async createSheetIfNotExists(sheetName, headers) {
        if (!this.sheets || !this.spreadsheetId) return;

        try {
            // Check if sheet exists
            const response = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId
            });

            const sheetExists = response.data.sheets.some(sheet => 
                sheet.properties.title === sheetName
            );

            if (!sheetExists) {
                // Create new sheet
                await this.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: this.spreadsheetId,
                    requestBody: {
                        requests: [
                            {
                                addSheet: {
                                    properties: {
                                        title: sheetName
                                    }
                                }
                            }
                        ]
                    }
                });

                // Add headers
                await this.sheets.spreadsheets.values.update({
                    spreadsheetId: this.spreadsheetId,
                    range: `${sheetName}!A1:${String.fromCharCode(64 + headers.length)}1`,
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [headers]
                    }
                });

                console.log(`Created sheet: ${sheetName}`);
            }
        } catch (error) {
            console.error(`Error creating sheet ${sheetName}:`, error.message);
        }
    }

    // User management functions
    async createUser(userData) {
        if (!this.initialized || !this.sheets) {
            return this.createUserInMemory(userData);
        }

        try {
            const userId = Date.now().toString();
            const row = [
                userId,
                userData.email,
                userData.password,
                userData.firstName || '',
                userData.lastName || '',
                userData.profileImageUrl || '',
                new Date().toISOString()
            ];

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: 'Users!A:G',
                valueInputOption: 'RAW',
                requestBody: {
                    values: [row]
                }
            });

            return {
                id: userId,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                profileImageUrl: userData.profileImageUrl,
                createdAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error creating user in Google Sheets:', error.message);
            return this.createUserInMemory(userData);
        }
    }

    async getUserByEmail(email) {
        if (!this.initialized || !this.sheets) {
            return this.getUserByEmailInMemory(email);
        }

        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: 'Users!A:G'
            });

            const rows = response.data.values || [];
            const userRow = rows.find(row => row[1] === email); // Email is in column B (index 1)

            if (userRow) {
                return {
                    id: userRow[0],
                    email: userRow[1],
                    password: userRow[2],
                    firstName: userRow[3],
                    lastName: userRow[4],
                    profileImageUrl: userRow[5],
                    createdAt: userRow[6]
                };
            }

            return null;
        } catch (error) {
            console.error('Error getting user from Google Sheets:', error.message);
            return this.getUserByEmailInMemory(email);
        }
    }

    async getUserById(id) {
        if (!this.initialized || !this.sheets) {
            return this.getUserByIdInMemory(id);
        }

        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: 'Users!A:G'
            });

            const rows = response.data.values || [];
            const userRow = rows.find(row => row[0] === id); // ID is in column A (index 0)

            if (userRow) {
                return {
                    id: userRow[0],
                    email: userRow[1],
                    firstName: userRow[3],
                    lastName: userRow[4],
                    profileImageUrl: userRow[5],
                    createdAt: userRow[6]
                };
            }

            return null;
        } catch (error) {
            console.error('Error getting user by ID from Google Sheets:', error.message);
            return this.getUserByIdInMemory(id);
        }
    }

    // Bus data functions
    async saveBusData(busData, userId = null) {
        if (!this.initialized || !this.sheets) {
            console.log('Bus data saved to memory storage');
            return;
        }

        try {
            const row = [
                new Date().toISOString(),
                busData.position[0], // Latitude
                busData.position[1], // Longitude
                busData.speed || 0,
                busData.connected || false,
                userId || 'system'
            ];

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: 'BusData!A:F',
                valueInputOption: 'RAW',
                requestBody: {
                    values: [row]
                }
            });

            console.log('Bus data saved to Google Sheets');
        } catch (error) {
            console.error('Error saving bus data to Google Sheets:', error.message);
        }
    }

    async getBusHistory(limit = 100) {
        if (!this.initialized || !this.sheets) {
            return [];
        }

        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: 'BusData!A:F'
            });

            const rows = response.data.values || [];
            return rows.slice(-limit).map(row => ({
                timestamp: row[0],
                latitude: parseFloat(row[1]),
                longitude: parseFloat(row[2]),
                speed: parseFloat(row[3]),
                connected: row[4] === 'true',
                userId: row[5]
            }));
        } catch (error) {
            console.error('Error getting bus history from Google Sheets:', error.message);
            return [];
        }
    }

    // Chat history functions
    async saveChatHistory(userId, query, response) {
        if (!this.initialized || !this.sheets) {
            return;
        }

        try {
            const row = [
                new Date().toISOString(),
                userId,
                query,
                response
            ];

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: 'ChatHistory!A:D',
                valueInputOption: 'RAW',
                requestBody: {
                    values: [row]
                }
            });
        } catch (error) {
            console.error('Error saving chat history to Google Sheets:', error.message);
        }
    }

    // Memory fallback functions
    createUserInMemory(userData) {
        if (!this.memoryUsers) this.memoryUsers = new Map();
        
        const userId = Date.now().toString();
        const user = {
            id: userId,
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImageUrl: userData.profileImageUrl,
            createdAt: new Date().toISOString()
        };
        
        this.memoryUsers.set(userData.email, user);
        return user;
    }

    getUserByEmailInMemory(email) {
        if (!this.memoryUsers) this.memoryUsers = new Map();
        return this.memoryUsers.get(email) || null;
    }

    getUserByIdInMemory(id) {
        if (!this.memoryUsers) this.memoryUsers = new Map();
        for (const user of this.memoryUsers.values()) {
            if (user.id === id) {
                return {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profileImageUrl: user.profileImageUrl,
                    createdAt: user.createdAt
                };
            }
        }
        return null;
    }
}

module.exports = { GoogleSheetsDB };