// Map variables
let map = null;
let busMarker = null;
let routePolyline = null;
let routePoints = [];
let showRoute = false;
let isMapInitialized = false;

// Default map center (can be updated when first GPS data arrives)
const DEFAULT_CENTER = [5.6037, -0.1870]; // Accra, Ghana
const DEFAULT_ZOOM = 13;

// Custom bus icon
const busIcon = L.divIcon({
    className: 'bus-marker',
    html: '<i class="fas fa-bus"></i>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

// Initialize map
function initializeMap() {
    try {
        console.log('Initializing map...');
        
        // Check if map container exists
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.warn('Map container not found, skipping map initialization');
            return;
        }
        
        // Create map instance
        map = L.map('map', {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            zoomControl: true,
            attributionControl: true
        });
        
        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 3
        }).addTo(map);
        
        // Add custom CSS for bus marker
        addMapStyles();
        
        // Add map event listeners
        setupMapEventListeners();
        
        isMapInitialized = true;
        console.log('Map initialized successfully');
        
    } catch (error) {
        console.error('Error initializing map:', error);
        if (typeof window.BusTracker !== 'undefined') {
            window.BusTracker.showError('Failed to initialize map. Please refresh the page.');
        }
    }
}

// Add custom styles for map elements
function addMapStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .bus-marker {
            background: linear-gradient(135deg, #3498db, #2980b9);
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
            animation: pulse 2s infinite;
        }
        
        .bus-marker:hover {
            transform: scale(1.1);
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
        
        .route-line {
            color: #e74c3c;
            weight: 4;
            opacity: 0.8;
        }
        
        .leaflet-popup-content-wrapper {
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .leaflet-popup-content {
            margin: 12px 16px;
            line-height: 1.4;
        }
    `;
    document.head.appendChild(style);
}

// Setup map event listeners
function setupMapEventListeners() {
    if (!map) return;
    
    map.on('click', function(e) {
        console.log('Map clicked at:', e.latlng);
    });
    
    map.on('zoomend', function() {
        console.log('Map zoom level:', map.getZoom());
    });
    
    map.on('moveend', function() {
        console.log('Map center:', map.getCenter());
    });
}

// Update bus position on map
function updateMapPosition(position, speed) {
    if (!isMapInitialized || !map) {
        console.warn('Map not initialized yet');
        return;
    }
    
    if (!position || position.length < 2 || (position[0] === 0 && position[1] === 0)) {
        console.warn('Invalid position data:', position);
        return;
    }
    
    const [lat, lng] = position;
    const busLatLng = L.latLng(lat, lng);
    
    try {
        // Remove existing marker if it exists
        if (busMarker) {
            map.removeLayer(busMarker);
        }
        
        // Create new marker
        busMarker = L.marker(busLatLng, { icon: busIcon }).addTo(map);
        
        // Create popup content
        const popupContent = `
            <div style="text-align: center;">
                <h4 style="margin: 0 0 8px 0; color: #2c3e50;">
                    <i class="fas fa-bus"></i> Bus Location
                </h4>
                <div style="margin-bottom: 6px;">
                    <strong>Coordinates:</strong><br>
                    ${lat.toFixed(6)}, ${lng.toFixed(6)}
                </div>
                <div style="margin-bottom: 6px;">
                    <strong>Speed:</strong> ${speed || 0} km/h
                </div>
                <div style="font-size: 0.9em; color: #7f8c8d;">
                    Last updated: ${new Date().toLocaleTimeString()}
                </div>
            </div>
        `;
        
        busMarker.bindPopup(popupContent);
        
        // Add to route if route tracking is enabled
        if (showRoute) {
            addToRoute(busLatLng);
        }
        
        // If this is the first position update, center the map
        if (routePoints.length === 0) {
            map.setView(busLatLng, 15);
        }
        
        console.log('Bus position updated on map:', position);
        
    } catch (error) {
        console.error('Error updating bus position on map:', error);
    }
}

// Add point to route
function addToRoute(latLng) {
    if (!latLng) return;
    
    routePoints.push(latLng);
    
    // Keep only last 50 points to avoid performance issues
    if (routePoints.length > 50) {
        routePoints = routePoints.slice(-50);
    }
    
    // Update route polyline
    updateRoutePolyline();
}

// Update route polyline
function updateRoutePolyline() {
    if (!map || routePoints.length < 2) return;
    
    try {
        // Remove existing route
        if (routePolyline) {
            map.removeLayer(routePolyline);
        }
        
        // Create new route polyline
        routePolyline = L.polyline(routePoints, {
            color: '#e74c3c',
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1,
            className: 'route-line'
        }).addTo(map);
        
        // Add popup to route
        routePolyline.bindPopup(`
            <div style="text-align: center;">
                <h4 style="margin: 0 0 8px 0; color: #2c3e50;">
                    <i class="fas fa-route"></i> Bus Route
                </h4>
                <div>
                    <strong>Points:</strong> ${routePoints.length}<br>
                    <strong>Distance:</strong> ~${calculateRouteDistance().toFixed(2)} km
                </div>
            </div>
        `);
        
    } catch (error) {
        console.error('Error updating route polyline:', error);
    }
}

// Calculate approximate route distance
function calculateRouteDistance() {
    if (routePoints.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < routePoints.length; i++) {
        totalDistance += routePoints[i-1].distanceTo(routePoints[i]);
    }
    
    return totalDistance / 1000; // Convert to kilometers
}

// Center map on bus
function centerMapOnBus() {
    if (!map || !busMarker) {
        console.warn('Cannot center map: map or bus marker not available');
        return;
    }
    
    try {
        const busPosition = busMarker.getLatLng();
        map.setView(busPosition, 16, { animate: true });
        
        // Open popup if closed
        if (!busMarker.isPopupOpen()) {
            busMarker.openPopup();
        }
        
        console.log('Map centered on bus position');
        
    } catch (error) {
        console.error('Error centering map on bus:', error);
    }
}

// Toggle route display
function toggleRoute() {
    showRoute = !showRoute;
    
    const toggleBtn = document.getElementById('toggleRouteBtn');
    
    if (showRoute) {
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        toggleBtn.title = 'Hide Route';
        toggleBtn.style.background = '#e74c3c';
        
        // If we have current bus position, start route from there
        if (busMarker) {
            const currentPos = busMarker.getLatLng();
            if (routePoints.length === 0) {
                routePoints.push(currentPos);
            }
        }
        
        console.log('Route tracking enabled');
    } else {
        toggleBtn.innerHTML = '<i class="fas fa-route"></i>';
        toggleBtn.title = 'Show Route';
        toggleBtn.style.background = '#95a5a6';
        
        // Remove route from map
        if (routePolyline) {
            map.removeLayer(routePolyline);
            routePolyline = null;
        }
        
        console.log('Route tracking disabled');
    }
}

// Clear route
function clearRoute() {
    routePoints = [];
    if (routePolyline) {
        map.removeLayer(routePolyline);
        routePolyline = null;
    }
    console.log('Route cleared');
}

// Resize map (for responsive design)
function resizeMap() {
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }
}

// Fit map to show all route points
function fitMapToRoute() {
    if (!map || routePoints.length === 0) return;
    
    try {
        const group = new L.featureGroup(routePoints.map(point => L.marker(point)));
        map.fitBounds(group.getBounds(), { padding: [20, 20] });
    } catch (error) {
        console.error('Error fitting map to route:', error);
    }
}

// Export functions for use in other modules
window.initializeMap = initializeMap;
window.updateMapPosition = updateMapPosition;
window.centerMapOnBus = centerMapOnBus;
window.toggleRoute = toggleRoute;
window.resizeMap = resizeMap;
window.clearRoute = clearRoute;
window.fitMapToRoute = fitMapToRoute;
