function areStopsInLocalStorage() {
    const localStorageValue = localStorage.getItem('stops');
    console.debug("[areStopsInLocalStorage] Are stops in local storage?", localStorageValue !== null);
    return localStorageValue !== null;
}

function areStopsOutdated() {
    const lastUpdated = getStopsInLocalStorageLastUpdated();
    console.debug("[areStopsOutdated] Last updated:", lastUpdated);
    return lastUpdated !== latestDataPackage;
}

function getStopsInLocalStorageLastUpdated() {
    return localStorage.getItem('stopsLastUpdated');
}

function setStopsInLocalStorageLastUpdated() {
    localStorage.setItem('stopsLastUpdated', latestDataPackage);
}

function getStopsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('stops'));
}

function setStopsInLocalStorage(stops) {
    localStorage.setItem('stops', JSON.stringify(stops));
}

function getStopById(stopId) {
    const stops = getStopsFromLocalStorage();
    return stops[stopId];
}

function saveFavoritesToLocalStorage() {
    localStorage.setItem('favoriteStops', JSON.stringify(favoriteStops));
}

function getFavoriteStopsFromStorage() {
    return JSON.parse(localStorage.getItem('favoriteStops')) || [];
}
