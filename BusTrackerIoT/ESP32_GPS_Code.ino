/*
 * ESP32 GPS Bus Tracker - IoT Device Code
 * Compatible with ESP32 + NEO-6M GPS + SIM800L GSM modules
 * 
 * Hardware Requirements (as per your system specs):
 * - ESP32 (Wi-Fi + Bluetooth)
 * - NEO-6M GPS Module
 * - SIM800L GSM Module (2G)
 * - LM2596 Buck Converter (12V→5V)
 * - Generic GPS+GSM antennas
 * - Jio/Airtel IoT Plan SIM Card
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h>

// Pin Configuration
#define GPS_RX_PIN 16
#define GPS_TX_PIN 17
#define GSM_RX_PIN 18
#define GSM_TX_PIN 19
#define LED_PIN 2

// Network Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "https://your-replit-domain.replit.app/api/update-position";

// Alternative GSM APN settings for Jio/Airtel
const char* apn = "jionet"; // Use "airtelgprs.com" for Airtel

// Software Serial for GPS and GSM
SoftwareSerial gpsSerial(GPS_RX_PIN, GPS_TX_PIN);
SoftwareSerial gsmSerial(GSM_RX_PIN, GSM_TX_PIN);

// GPS Data Structure
struct GPSData {
  float latitude = 0.0;
  float longitude = 0.0;
  float speed = 0.0;
  bool isValid = false;
  String timestamp = "";
};

// Global Variables
GPSData currentGPS;
unsigned long lastUpdate = 0;
const unsigned long UPDATE_INTERVAL = 10000; // 10 seconds
bool wifiConnected = false;
bool gsmConnected = false;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  
  // Initialize GPS
  gpsSerial.begin(9600);
  
  // Initialize GSM
  gsmSerial.begin(9600);
  
  Serial.println("ESP32 Bus Tracker Starting...");
  digitalWrite(LED_PIN, HIGH);
  
  // Try WiFi first, fallback to GSM
  if (connectWiFi()) {
    wifiConnected = true;
    Serial.println("WiFi connection established");
  } else {
    Serial.println("WiFi failed, initializing GSM...");
    if (initializeGSM()) {
      gsmConnected = true;
      Serial.println("GSM connection established");
    } else {
      Serial.println("Both WiFi and GSM failed!");
    }
  }
  
  digitalWrite(LED_PIN, LOW);
  Serial.println("System initialized. Starting GPS tracking...");
}

void loop() {
  // Read GPS data
  if (readGPS()) {
    // Send data if interval has passed
    if (millis() - lastUpdate >= UPDATE_INTERVAL) {
      if (currentGPS.isValid) {
        bool success = false;
        
        // Try WiFi first, then GSM
        if (wifiConnected && WiFi.status() == WL_CONNECTED) {
          success = sendDataWiFi();
        } else if (gsmConnected) {
          success = sendDataGSM();
        }
        
        if (success) {
          Serial.println("Data sent successfully");
          digitalWrite(LED_PIN, HIGH);
          delay(100);
          digitalWrite(LED_PIN, LOW);
        } else {
          Serial.println("Failed to send data");
          // Try to reconnect
          reconnectNetworks();
        }
        
        lastUpdate = millis();
      } else {
        Serial.println("Waiting for valid GPS fix...");
      }
    }
  }
  
  delay(1000);
}

bool connectWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("Connected! IP: ");
    Serial.println(WiFi.localIP());
    return true;
  }
  
  Serial.println("\nWiFi connection failed");
  return false;
}

bool initializeGSM() {
  Serial.println("Initializing GSM module...");
  
  // Reset GSM module
  gsmSerial.println("AT");
  delay(1000);
  
  // Check if module responds
  if (!waitForResponse("OK", 5000)) {
    Serial.println("GSM module not responding");
    return false;
  }
  
  // Set APN
  gsmSerial.println("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"");
  delay(1000);
  
  String apnCommand = "AT+SAPBR=3,1,\"APN\",\"" + String(apn) + "\"";
  gsmSerial.println(apnCommand);
  delay(1000);
  
  // Open GPRS connection
  gsmSerial.println("AT+SAPBR=1,1");
  delay(3000);
  
  // Check connection
  gsmSerial.println("AT+SAPBR=2,1");
  if (waitForResponse("OK", 5000)) {
    Serial.println("GSM GPRS connection established");
    return true;
  }
  
  Serial.println("GSM GPRS connection failed");
  return false;
}

bool readGPS() {
  while (gpsSerial.available()) {
    String sentence = gpsSerial.readStringUntil('\n');
    
    // Parse NMEA sentences (focusing on GPRMC for location and speed)
    if (sentence.startsWith("$GPRMC")) {
      return parseGPRMC(sentence);
    }
  }
  return false;
}

bool parseGPRMC(String sentence) {
  // GPRMC format: $GPRMC,time,status,lat,lat_dir,lon,lon_dir,speed,course,date,checksum
  int commaIndex[12];
  int commaCount = 0;
  
  // Find all comma positions
  for (int i = 0; i < sentence.length() && commaCount < 12; i++) {
    if (sentence.charAt(i) == ',') {
      commaIndex[commaCount] = i;
      commaCount++;
    }
  }
  
  if (commaCount < 9) return false;
  
  // Check if data is valid (status should be 'A')
  String status = sentence.substring(commaIndex[1] + 1, commaIndex[2]);
  if (status != "A") {
    currentGPS.isValid = false;
    return false;
  }
  
  // Parse latitude
  String latStr = sentence.substring(commaIndex[2] + 1, commaIndex[3]);
  String latDir = sentence.substring(commaIndex[3] + 1, commaIndex[4]);
  
  // Parse longitude
  String lonStr = sentence.substring(commaIndex[4] + 1, commaIndex[5]);
  String lonDir = sentence.substring(commaIndex[5] + 1, commaIndex[6]);
  
  // Parse speed (knots to km/h)
  String speedStr = sentence.substring(commaIndex[6] + 1, commaIndex[7]);
  
  if (latStr.length() > 0 && lonStr.length() > 0) {
    // Convert DDMM.MMMM to decimal degrees
    currentGPS.latitude = convertToDecimalDegrees(latStr, latDir);
    currentGPS.longitude = convertToDecimalDegrees(lonStr, lonDir);
    currentGPS.speed = speedStr.toFloat() * 1.852; // Convert knots to km/h
    currentGPS.isValid = true;
    
    Serial.printf("GPS: Lat=%.6f, Lon=%.6f, Speed=%.1f km/h\n", 
                  currentGPS.latitude, currentGPS.longitude, currentGPS.speed);
    
    return true;
  }
  
  return false;
}

float convertToDecimalDegrees(String coord, String direction) {
  if (coord.length() < 4) return 0.0;
  
  float degrees = coord.substring(0, coord.indexOf('.') - 2).toFloat();
  float minutes = coord.substring(coord.indexOf('.') - 2).toFloat();
  
  float decimal = degrees + (minutes / 60.0);
  
  if (direction == "S" || direction == "W") {
    decimal = -decimal;
  }
  
  return decimal;
}

bool sendDataWiFi() {
  if (WiFi.status() != WL_CONNECTED) return false;
  
  HTTPClient http;
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["lat"] = currentGPS.latitude;
  doc["lng"] = currentGPS.longitude;
  doc["speed"] = currentGPS.speed;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  http.end();
  
  return (httpResponseCode == 200);
}

bool sendDataGSM() {
  // Initialize HTTP service
  gsmSerial.println("AT+HTTPINIT");
  if (!waitForResponse("OK", 5000)) return false;
  
  // Set HTTP parameters
  gsmSerial.println("AT+HTTPPARA=\"CID\",1");
  delay(1000);
  
  String urlCommand = "AT+HTTPPARA=\"URL\",\"" + String(serverURL) + "\"";
  gsmSerial.println(urlCommand);
  delay(1000);
  
  gsmSerial.println("AT+HTTPPARA=\"CONTENT\",\"application/json\"");
  delay(1000);
  
  // Prepare JSON data
  String jsonData = "{\"lat\":" + String(currentGPS.latitude, 6) + 
                   ",\"lng\":" + String(currentGPS.longitude, 6) + 
                   ",\"speed\":" + String(currentGPS.speed, 1) + "}";
  
  // Set data length
  String dataCommand = "AT+HTTPDATA=" + String(jsonData.length()) + ",10000";
  gsmSerial.println(dataCommand);
  
  if (waitForResponse("DOWNLOAD", 3000)) {
    gsmSerial.println(jsonData);
    delay(1000);
    
    // Send POST request
    gsmSerial.println("AT+HTTPACTION=1");
    if (waitForResponse("200", 10000)) {
      gsmSerial.println("AT+HTTPTERM");
      return true;
    }
  }
  
  gsmSerial.println("AT+HTTPTERM");
  return false;
}

bool waitForResponse(String expected, unsigned long timeout) {
  unsigned long start = millis();
  String response = "";
  
  while (millis() - start < timeout) {
    if (gsmSerial.available()) {
      response += gsmSerial.readString();
      if (response.indexOf(expected) >= 0) {
        return true;
      }
    }
    delay(100);
  }
  
  return false;
}

void reconnectNetworks() {
  Serial.println("Attempting to reconnect networks...");
  
  if (!wifiConnected || WiFi.status() != WL_CONNECTED) {
    if (connectWiFi()) {
      wifiConnected = true;
    }
  }
  
  if (!wifiConnected && !gsmConnected) {
    if (initializeGSM()) {
      gsmConnected = true;
    }
  }
}