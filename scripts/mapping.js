let map;
var markers = [];
var stopMarkers = [];
var latestFetchedBusLocations = [];
var interpolatedPaths = {};

function getMap() {
    if (!map) {
        console.error("Map is not initialized!");
        return null;
    }

    return map;
}

window.addEventListener("load", function(event) {
    console.info("[window.onload] Initializing map");
    map = L.map('map', {
        minZoom: 10,
        maxZoom: 19,
        zoomControl: false
    }).setView([60.4515596, 22.2643021], 16);
    var CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors - Map Tiles &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });

    CartoDB_Voyager.addTo(map);

    updateStopMarkersOnMap();

    // Listen for zoom changes
    map.on('zoom', function () {
        const zoomLevel = map.getZoom();
        updateStopMarkersOnMap();
    });

    map.on('move', function () {
        updateStopMarkersOnMap();
    });

    map.on('click', function (clickEvent) {
        if ($('#activeSearchContainer').is(':visible')) {
            closeSearchBoxContainer();
        }

        if ($('#stopDisplayContainer').is(':visible')) {
            closeStopDisplay();
        }
    })
});

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

/**
 * Determines if a given point is within the current map bounds.
 * 
 * @param {Object} point - The point to check, with `lat` and `lon` properties.
 * @returns {boolean} - True if the point is within the map bounds, otherwise false.
 */
function isPointWithinMapBounds(point) {
    if (!map) {
        console.error("Map is not initialized!");
        return false;
    }

    // Get the current map bounds
    const bounds = map.getBounds();

    // Check if the point is within the bounds
    return bounds.contains([point.lat, point.lon]);
}

function deleteStopMarkersFromMap() {
    stopMarkers.forEach(marker => marker.remove());
    stopMarkers = [];
}

function deleteStopMarkerFromMapBasedOnCoordinates(lat, lon) {
    const marker = stopMarkers.find(marker => marker.getLatLng().lat === lat && marker.getLatLng().lng === lon);

    if (marker) {
        marker.remove();
    }
}

function findMarkerByCoordinates(lat, lon) {
    return stopMarkers.find(marker => marker.getLatLng().lat === lat && marker.getLatLng().lng === lon);
}

function updateStopMarkersOnMap() {
    // Definitely don't show stops if the map is zoomed out too far. Guaranteed crash of browser
    if (map.getZoom() < 15) {
        deleteStopMarkersFromMap();
        return
    }

    const stops = getStopsFromLocalStorage();
    var newMarkerCounter = 0;
    var performanceStart = performance.now();

    Object.keys(stops)
        .filter(stopId => isPointWithinMapBounds({
            lat: stops[stopId].stop_lat,
            lon: stops[stopId].stop_lon
        }))
        .forEach(stopId => {
            // Check if the stop already has a marker
            if (findMarkerByCoordinates(stops[stopId].stop_lat, stops[stopId].stop_lon)) {
                return;
            }

            const stop = stops[stopId];
            const stopMarker = L.marker([stop.stop_lat, stop.stop_lon], { stopId: stopId })
                .addTo(map)
                .bindPopup(stop.stop_name);

            stopMarker.on('click', function (event) {
                const stopId = event.target.options.stopId;
                onStopMarkerClick(stopId);
            });

            stopMarkers.push(stopMarker);

            newMarkerCounter++;
    });

    if (performance.now() - performanceStart > 100) {
        console.warn(`[updateStopMarkersOnMap (PERF)] Added or modified ${newMarkerCounter} markers in ${performance.now() - performanceStart}ms. 100ms is the warning threshold.`);
    }

    // Remove markers that are no longer in view
    stopMarkers.filter(marker => !isPointWithinMapBounds({
        lat: marker.getLatLng().lat,
        lon: marker.getLatLng().lng
    }))
        .forEach(marker => { 
            marker.remove() 
            stopMarkers = stopMarkers.filter(m => m !== marker);
        });
}

// Fetch new vehicle information every 4 seconds and place markers
/*
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
*/