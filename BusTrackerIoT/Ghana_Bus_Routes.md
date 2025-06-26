# Ghana Bus Tracking - Major Routes & Locations

## Major Cities and Coordinates

### Greater Accra Region
- **Accra (Capital)**: 5.6037, -0.1870
- **Tema**: 5.6698, 0.0166
- **Kasoa**: 5.5333, -0.4167
- **Madina**: 5.6833, -0.1667

### Ashanti Region
- **Kumasi**: 6.6885, -1.6244
- **Obuasi**: 6.2027, -1.6708
- **Ejisu**: 6.7333, -1.3667

### Western Region
- **Takoradi**: 4.8845, -1.7554
- **Cape Coast**: 5.1054, -1.2466

### Northern Region
- **Tamale**: 9.4034, -0.8424
- **Bolgatanga**: 10.7856, -0.8516

## Popular Bus Routes

### Inter-City Routes
1. **Accra ↔ Kumasi** (Most Popular)
   - Distance: ~250km
   - Journey Time: 3-4 hours
   - Major stops: Nsawam, Nkawkaw, Ejisu

2. **Accra ↔ Takoradi**
   - Distance: ~240km
   - Journey Time: 3.5-4 hours
   - Major stops: Winneba, Cape Coast

3. **Accra ↔ Tamale**
   - Distance: ~600km
   - Journey Time: 8-10 hours
   - Major stops: Kumasi, Techiman, Kintampo

### Accra Metro Routes
1. **Circle ↔ Kaneshie**: 5.5833, -0.2500 ↔ 5.5667, -0.2333
2. **Madina ↔ 37**: 5.6833, -0.1667 ↔ 5.6167, -0.1833
3. **Tema ↔ Accra Central**: 5.6698, 0.0166 ↔ 5.5500, -0.2167

## Major Bus Stations

### Accra
- **Kaneshie Station**: 5.5667, -0.2333
- **Circle Station**: 5.5833, -0.2500
- **37 Station**: 5.6167, -0.1833
- **Tema Station**: 5.6698, 0.0166

### Kumasi
- **Kejetia Terminal**: 6.6972, -1.6278
- **Asafo Station**: 6.6833, -1.6167

## Bus Operators in Ghana

### Major Companies
1. **VIP Transport** - Premium intercity service
2. **STC (State Transport Corporation)** - Government-owned
3. **GPRTU (Ghana Private Road Transport Union)** - Private operators
4. **Metro Mass Transit** - Urban and suburban routes
5. **Intercity STC** - Long-distance routes

## Testing Coordinates for Your System

### Test Route: Accra to Tema
```json
[
  {"lat": 5.6037, "lng": -0.1870, "location": "Accra Central"},
  {"lat": 5.6167, "lng": -0.1500, "location": "Nungua"},
  {"lat": 5.6400, "lng": -0.1000, "location": "Ashaiman"},
  {"lat": 5.6698, "lng": 0.0166, "location": "Tema"}
]
```

### Test Route: Accra to Kumasi (Key Points)
```json
[
  {"lat": 5.6037, "lng": -0.1870, "location": "Accra"},
  {"lat": 5.8167, "lng": -0.3333, "location": "Nsawam"},
  {"lat": 6.0500, "lng": -0.7667, "location": "Nkawkaw"},
  {"lat": 6.6885, "lng": -1.6244, "location": "Kumasi"}
]
```

## Network Coverage Notes

### Mobile Networks in Ghana
- **MTN Ghana** - Best coverage nationwide
- **Vodafone Ghana** - Good urban coverage
- **AirtelTigo** - Decent coverage in major cities

### Recommended for IoT
- MTN Ghana has the best 2G/3G coverage for rural areas
- Consider dual-SIM setup for redundancy
- Data plans: MTN IoT packages available

## Local Considerations

### Traffic Patterns
- **Peak Hours**: 6-9 AM, 4-7 PM
- **Market Days**: Wednesdays and Saturdays (increased traffic)
- **Rainy Season**: May-October (slower speeds)

### Road Conditions
- **Accra-Tema Motorway**: Excellent (4-lane highway)
- **Accra-Kumasi Highway**: Good (mostly paved)
- **Northern Routes**: Variable (some unpaved sections)

### Time Zone
- **Ghana Standard Time (GMT+0)**
- No daylight saving time adjustments needed