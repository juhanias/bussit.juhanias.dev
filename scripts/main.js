window.addEventListener("load", function(event) {
    // Check if stops are in local storage. This indicates that the user has visited the page before.
    // This is followed by a check to see if the data is outdated.
    if (!areStopsInLocalStorage()) {
        getStops()
            .then(stops => {
                setStopsInLocalStorage(stops);
                setStopsInLocalStorageLastUpdated();
            });
    }
});
