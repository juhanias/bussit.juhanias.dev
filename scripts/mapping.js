let map;
var markers = [];
var latestFetchedBusLocations = [];
var interpolatedPaths = {};

window.onload = function () {
    map = L.map('map', {
        minZoom: 10,
        maxZoom: 18,
    }).setView([60.4515596, 22.2643021], 16);
    var CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });

    CartoDB_Voyager.addTo(map);
};

function placeDotsOn(map, vehicles) {
    vehicles.forEach(vehicle => {
        // Check if the vehicle already has a marker
        const existingMarker = findVehicleElement(vehicle.vehicleref);

        if (existingMarker) {
            // Start interpolating points between current and new location
            const currentLatLng = existingMarker.getLatLng();
            const interpolatedPoints = interpolatePointsInBetween(
                currentLatLng.lat, currentLatLng.lng, vehicle.latitude, vehicle.longitude, 40 // 40 steps over 4 seconds
            );

            // Store the interpolated points to move the marker
            interpolatedPaths[vehicle.vehicleref] = {
                points: interpolatedPoints,
                index: 0, // Start from the first interpolated point
            };

        } else {
            // Create a new marker
            const busMarker = L.marker([vehicle.latitude, vehicle.longitude], { vehicleRef: vehicle.vehicleref }).addTo(map)
                .bindPopup(`Bussi ${vehicle.lineref}`);

            markers.push(busMarker);
        }
    });
}

function interpolatePointsInBetween(lat1, lon1, lat2, lon2, numPoints) {
    const points = [];
    const latStep = (lat2 - lat1) / (numPoints + 1);
    const lonStep = (lon2 - lon1) / (numPoints + 1);

    for (let i = 1; i <= numPoints; i++) {
        const lat = lat1 + latStep * i;
        const lon = lon1 + lonStep * i;
        points.push([lat, lon]);
    }

    return points;
}

function findVehicleElement(vehicleRef) {
    return markers.find(marker => marker.options.vehicleRef === vehicleRef);
}

function moveMarkers() {
    Object.keys(interpolatedPaths).forEach(vehicleRef => {
        const path = interpolatedPaths[vehicleRef];
        const existingMarker = findVehicleElement(vehicleRef);

        if (path && existingMarker) {
            if (path.index < path.points.length) {
                // Move the marker to the next interpolated point
                const nextPoint = path.points[path.index];
                existingMarker.setLatLng(nextPoint);

                // Increment the index
                path.index += 1;
            } else {
                // Once the marker has reached the destination, remove its path
                delete interpolatedPaths[vehicleRef];
            }
        }
    });
}

// Fetch new vehicle information every 4 seconds and place markers
setInterval(() => {
    getAllVehicleInformation().then(vehicleInformation => {
        const vehicles = Object.keys(vehicleInformation.result.vehicles)
            .map(key => {
                return vehicleInformation.result.vehicles[key];
            })
            .filter(vehicle => vehicle.latitude && vehicle.longitude);

        placeDotsOn(map, vehicles);
    });
}, 4000);

// Move markers ''smoothly'' every 100ms
setInterval(moveMarkers, 100);

setInterval(() => {
    getAllVehicleInformation().then(vehicleInformation => {
        const vehicles = Object.keys(vehicleInformation.result.vehicles)
            .map(key => {
                return vehicleInformation.result.vehicles[key];
            })
            .filter(vehicle => vehicle.latitude && vehicle.longitude);

        placeDotsOn(map, vehicles);
    });
}, 4000);