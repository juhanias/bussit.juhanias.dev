var liveVehicleMarkers = [];
var inSpecificRouteView = false;

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

function isMapInSpecificRouteView() {
    return inSpecificRouteView;
}