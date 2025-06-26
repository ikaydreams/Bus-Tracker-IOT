# ESP32 Bus Tracker - IoT Device Setup Guide

## Hardware Components (As Per Your Specifications)

| Component | Model | Purpose |
|-----------|-------|---------|
| Microcontroller | ESP32 (Wi-Fi+Bluetooth) | Main processing unit |
| GPS Module | NEO-6M | Location tracking |
| GSM Module | SIM800L (2G) | Cellular connectivity |
| Power Supply | LM2596 Buck Converter (12V→5V) | Power regulation |
| Antennas | Generic GPS+GSM antennas | Signal reception |
| Enclosure | Plastic Junction Box | Weather protection |
| SIM Card | Jio/Airtel IoT Plan | Data connectivity |

## Wiring Diagram

### ESP32 Connections:
```
ESP32 Pin    →  Component
GPIO 16      →  GPS RX
GPIO 17      →  GPS TX
GPIO 18      →  GSM RX
GPIO 19      →  GSM TX
GPIO 2       →  Status LED
3.3V         →  GPS VCC, GSM VCC
GND          →  GPS GND, GSM GND
```

### Power Supply:
```
12V Input    →  LM2596 Input
LM2596 Output→  5V to ESP32 VIN
```

## Software Setup

### 1. Arduino IDE Configuration
```bash
# Install ESP32 board package
# Add this URL to Board Manager:
https://dl.espressif.com/dl/package_esp32_index.json

# Install required libraries:
- ArduinoJson (by Benoit Blanchon)
- SoftwareSerial (built-in)
```

### 2. Code Configuration
Update these variables in the Arduino code:

```cpp
// WiFi Settings
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server URL (Replace with your Replit domain)
const char* serverURL = "https://your-replit-domain.replit.app/api/update-position";

// GSM APN Settings
const char* apn = "jionet";        // For Jio
// const char* apn = "airtelgprs.com"; // For Airtel
```

### 3. Upload Process
1. Connect ESP32 to computer via USB
2. Select Board: "ESP32 Dev Module"
3. Select correct COM port
4. Upload the code
5. Open Serial Monitor (115200 baud) to see debug output

## Testing Your Setup

### 1. GPS Testing
```
Expected Serial Output:
GPS: Lat=5.603700, Lon=-0.187000, Speed=0.0 km/h
```

### 2. Network Testing
```
WiFi Output:
Connected! IP: 192.168.1.100

GSM Output:
GSM GPRS connection established
```

### 3. Data Transmission Testing
```
Success Output:
Data sent successfully
[LED blinks briefly]
```

## Installation in Vehicle

### 1. Mounting Location
- Inside dashboard or under seat
- GPS antenna near window/roof
- GSM antenna with clear signal path
- Avoid metal interference

### 2. Power Connection
- Connect to vehicle's 12V system
- Use fuse for protection (5A recommended)
- Consider ignition-switched power to save battery

### 3. Antenna Placement
- GPS antenna: Roof or dashboard (sky view)
- GSM antenna: Outside vehicle or near window
- Keep antennas separated to avoid interference

## Troubleshooting

### GPS Issues
```
Problem: No GPS fix
Solution: 
- Check antenna placement
- Wait 2-5 minutes for cold start
- Verify wiring connections
```

### Network Issues
```
Problem: WiFi connection fails
Solution:
- Check SSID/password
- Verify signal strength
- System will fallback to GSM

Problem: GSM connection fails
Solution:
- Check SIM card activation
- Verify APN settings
- Check signal strength
```

### Data Transmission Issues
```
Problem: Server not receiving data
Solution:
- Check server URL in code
- Verify server is running
- Test API endpoint manually
```

## Advanced Features

### 1. Power Management
Add sleep mode for battery conservation:
```cpp
// Deep sleep for 30 seconds
esp_sleep_enable_timer_wakeup(30 * 1000000);
esp_deep_sleep_start();
```

### 2. Offline Data Storage
Store GPS data locally when network is unavailable:
```cpp
#include <SPIFFS.h>
// Store data in flash memory
// Send when connection is restored
```

### 3. Emergency Features
Add panic button or geofence alerts:
```cpp
// Send immediate alert for emergency situations
// Implement geofence boundary checking
```

## Maintenance

### Regular Checks
- Monitor data transmission frequency
- Check antenna connections monthly
- Verify SIM card data balance
- Clean GPS antenna surface

### Software Updates
- Monitor serial output for errors
- Update server URL if changed
- Upgrade firmware as needed

## Cost Estimation (India)

| Component | Approximate Cost (₹) |
|-----------|---------------------|
| ESP32 | 500-800 |
| NEO-6M GPS | 400-600 |
| SIM800L GSM | 600-900 |
| LM2596 Converter | 100-200 |
| Antennas | 200-400 |
| Enclosure & Misc | 300-500 |
| **Total** | **₹2,100-3,400** |

### Monthly Operating Costs
- Jio IoT Plan: ₹99-199/month
- Airtel IoT Plan: ₹149-249/month

## Support

For technical issues:
1. Check serial monitor output
2. Verify hardware connections
3. Test individual components
4. Review server logs for data reception

Your bus tracking system is now ready for deployment!