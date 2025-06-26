# Google Sheets Database Setup for Ghana Bus Tracker

## Overview

The Ghana Bus Tracker now uses Google Sheets as its database for storing:
- User accounts and authentication data
- Real-time bus GPS tracking history
- Chat conversation logs between users and the bot

## Setup Instructions

### 1. Create Google Sheets Document

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Ghana Bus Tracker Database"
4. Copy the spreadsheet ID from the URL
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google Sheets API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### 3. Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in details:
   - **Name**: Ghana Bus Tracker Service
   - **Description**: Service account for bus tracking database access
4. Click "Create and Continue"
5. Grant roles (optional for this step)
6. Click "Done"

### 4. Generate Service Account Key

1. Click on the created service account email
2. Go to "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Select "JSON" format
5. Download the JSON file
6. **Important**: Keep this file secure - it contains private credentials

### 5. Share Spreadsheet with Service Account

1. Open your Google Sheets document
2. Click "Share" button
3. Add the service account email (found in the JSON file as `client_email`)
4. Give "Editor" permissions
5. Uncheck "Notify people" 
6. Click "Share"

### 6. Environment Configuration

Add these environment variables to your Replit project:

```bash
# Required: Your Google Sheets document ID
GOOGLE_SHEET_ID=your_spreadsheet_id_here

# Required: The entire JSON service account key as a string
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project",...}'
```

**To add environment variables in Replit:**
1. Click the "Secrets" tab (lock icon) in the sidebar
2. Add each variable with its value
3. The system will automatically load them

## Database Schema

The system automatically creates these sheets in your Google Sheets document:

### Users Sheet
| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | String | Unique user identifier |
| Email | String | User email address |
| Password | String | User password (plain text for demo) |
| FirstName | String | User's first name |
| LastName | String | User's last name |
| ProfileImageUrl | String | Avatar URL |
| CreatedAt | DateTime | Account creation timestamp |

### BusData Sheet
| Column | Data Type | Description |
|--------|-----------|-------------|
| Timestamp | DateTime | When GPS data was recorded |
| Latitude | Number | GPS latitude coordinate |
| Longitude | Number | GPS longitude coordinate |
| Speed | Number | Bus speed in km/h |
| DeviceConnected | Boolean | Whether GPS device is online |
| UserID | String | User who submitted the data |

### ChatHistory Sheet
| Column | Data Type | Description |
|--------|-----------|-------------|
| Timestamp | DateTime | When chat occurred |
| UserID | String | User who sent the message |
| Query | String | User's question to the bot |
| Response | String | Bot's response |

## Features

### Real-time Data Storage
- All GPS updates are automatically saved to Google Sheets
- Bus position history is queryable via API
- Chat conversations are logged for analysis

### User Management
- User accounts stored in Google Sheets
- Session-based authentication
- Profile data with avatars

### Data Analytics
- View historical GPS tracking data
- Analyze user chat patterns
- Export data for further analysis

## API Endpoints

### Get Bus History
```
GET /api/bus-history?limit=100
Authorization: Required (login session)
```

Returns recent GPS tracking data from Google Sheets.

### Health Check
```
GET /api/health
```

Now includes database status (Google Sheets vs Memory).

## Fallback Behavior

If Google Sheets is not configured or unavailable:
- System automatically falls back to in-memory storage
- All functionality continues to work
- No data persistence between server restarts
- Console shows "using memory storage" messages

## Security Notes

### Production Recommendations
1. **Never commit service account keys to version control**
2. **Use environment variables for all credentials**
3. **Implement password hashing (currently plain text for demo)**
4. **Consider row-level security for multi-tenant usage**
5. **Monitor API quotas and usage**

### Google Sheets Limitations
- **100 requests per 100 seconds per user**
- **Maximum 10 million cells per spreadsheet**
- **No built-in data validation or constraints**

## Troubleshooting

### Common Issues

**"Google Sheets not configured"**
- Check GOOGLE_SHEET_ID environment variable
- Verify GOOGLE_SERVICE_ACCOUNT_KEY is valid JSON

**"Permission denied"**
- Ensure service account email is shared with the spreadsheet
- Check service account has Editor permissions

**"Sheet not found"**
- System auto-creates sheets on first run
- Check spreadsheet ID is correct

**"Quota exceeded"**
- Google Sheets API has rate limits
- System falls back to memory storage automatically

### Testing the Setup

1. Start the server - should see "Google Sheets database initialized"
2. Create a new user account via signup
3. Check the Users sheet for new row
4. Send GPS update via IoT device or API
5. Check BusData sheet for tracking entry
6. Use chatbot and verify ChatHistory sheet

## Cost

Google Sheets API usage is **free** for this application:
- Well within free tier limits
- No additional Google Cloud charges
- Only standard Google Drive storage costs apply

Your Ghana bus tracking system now has persistent data storage with Google Sheets!