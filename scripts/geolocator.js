var geoLocationMarker;
var isBeingGeolocated = false;

async function getGeoLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

$(document).on('click', '#locateMeButton', async function () {
    if (isBeingGeolocated) {
        return;
    }

    if (geoLocationMarker) {
        // Move the map to the user's location
        map.panTo(geoLocationMarker.getLatLng());
        return;
    }

    // Change the image source of the locate me button to indicate that the user's location is being fetched
    $('#locateMeButton').addClass('loading');

    isBeingGeolocated = true;
    getGeoLocation()
        .then(position => {
            isBeingGeolocated = false;
            $('#locateMeButton').removeClass('loading');

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
            isBeingGeolocated = false;
            markGeolocatorButtonAsNotLoading();
            console.error("Error getting location:", error);
            markGeolocatorButtonAsError();
            setTimeout(markGeolocatorButtonAsNotError, 2000);
        });
});

$(document).on('click', '.geoLocationMarker', function () {
    // Pan to the user's location on the map when the marker is clicked
    map.panTo(geoLocationMarker.getLatLng());
});

async function markGeolocatorButtonAsLoading() {
    $('#locateMeButton').addClass('loading');
}

async function markGeolocatorButtonAsNotLoading() {
    $('#locateMeButton').removeClass('loading');
}

async function markGeolocatorButtonAsError() {
    $('#locateMeButton').addClass('error');
}

async function markGeolocatorButtonAsNotError() {
    $('#locateMeButton').removeClass('error');
}
