var geoLocationMarker;

async function getGeoLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

$(document).on('click', '#locateMeButton', async function () {
    if (geoLocationMarker) {
        // Move the map to the user's location
        map.panTo(geoLocationMarker.getLatLng());
        return;
    }

    getGeoLocation()
        .then(position => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 17);

            geoLocationMarker = L.marker([latitude, longitude], {
                icon: new L.divIcon({
                    className: 'geoLocationMarker',
                    html: `<img src="icons/ic_fluent_person_24_filled.svg">`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                })
            }).addTo(map);

            navigator.geolocation.watchPosition(position => {
                const { latitude, longitude } = position.coords;
                geoLocationMarker.setLatLng([latitude, longitude]);
            });
        })
        .catch(error => {
            console.error("Error getting location:", error);
        });
});

$(document).on('click', '.geoLocationMarker', function () {
    // Pan to the user's location on the map when the marker is clicked
    map.panTo(geoLocationMarker.getLatLng());
});