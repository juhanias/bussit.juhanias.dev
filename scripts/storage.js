function areStopsInLocalStorage() {
    const localStorageValue = localStorage.getItem('stops');
    console.debug("[areStopsInLocalStorage] Are stops in local storage?", localStorageValue !== null);
    return localStorageValue !== null;
}

function getStopsInLocalStorageLastUpdated() {
    return localStorage.getItem('stopsLastUpdated');
}

function setStopsInLocalStorageLastUpdated() {
    localStorage.setItem('stopsLastUpdated', new Date().toISOString());
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
