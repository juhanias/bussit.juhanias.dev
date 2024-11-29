window.addEventListener("load", async function(event) {
    await fetchLatestDataPackage()

    // Data fixer upper
    // Patch Nov 30th: stopsLastUpdated should not be a timestamp but the data package id
    let storageLastUpdated = localStorage.getItem('stopsLastUpdated');
    if (storageLastUpdated != null && storageLastUpdated.startsWith('2024-')) {
        this.localStorage.removeItem('stopsLastUpdated');
        this.localStorage.removeItem('stops');
        this.window.location.reload();
    }

    // Check if stops are in local storage. This indicates that the user has visited the page before.
    // This is followed by a check to see if the data is outdated.
    if (!areStopsInLocalStorage()) {
        getStops()
            .then(stops => {
                setStopsInLocalStorage(stops);
                setStopsInLocalStorageLastUpdated();
            });
    } else if (areStopsOutdated()) {
        getStops()
            .then(stops => {
                setStopsInLocalStorage(stops);
                setStopsInLocalStorageLastUpdated();
            });
    }

    favoriteStops = getFavoriteStopsFromStorage();

    updateVehicleLocationInfo();
});
