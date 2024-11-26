var favoriteStops = [];

function addFavoriteStop(stopId) {
    if (favoriteStops.includes(stopId)) {
        return;
    }

    favoriteStops.push(stopId);
    saveFavoritesToLocalStorage();
}

function removeFavorite(stopId) {
    favoriteStops = favoriteStops.filter(favorite => favorite !== stopId);
    saveFavoritesToLocalStorage();
}

function isStopFavorite(stopId) {
    return favoriteStops.includes(stopId);
}

function getFavoriteStops() {
    return favoriteStops;
}

function toggleFavoriteStop() {
    var stopId = getStopIdCurrentlyInFocus();

    if (isStopFavorite(stopId)) {
        removeFavorite(stopId);
    } else {
        addFavoriteStop(stopId);
    }

    updateActiveStopFavoriteStatus();
    updateStopMarkerColorToReflectFavoriteStatus(stopId);
}

function updateActiveStopFavoriteStatus() {
    var stopId = getStopIdCurrentlyInFocus();
    var isFavorite = isStopFavorite(stopId);
    
    $('#displayToggleFavoriteButton').attr('src', `icons/ic_fluent_star_24_regular${isFavorite ? '_filled' : ''}.svg`);
}

function updateStopMarkerColorToReflectFavoriteStatus(stopId) {
    const marker = findMarkerByCoordinates(getStopById(stopId).stop_lat, getStopById(stopId).stop_lon);

    if (marker) {
        marker.setIcon(new L.Icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${isStopFavorite(stopId) ? 'gold' : 'blue'}.png`,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }));
    }
}
