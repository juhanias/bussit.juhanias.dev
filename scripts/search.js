function hideSearchButtonFromUI() {
  $('#searchButton').fadeOut(200);
}

function showSearchButtonFromUI() {
  $('#searchButton').fadeIn(250);
}

function showSearchBoxContainer() {
  $('#activeSearchContainer').show();
}

function hideSearchBoxContainer() {
  $('#activeSearchContainer').hide();
}

function openSearchBoxContainer() {
  hideSearchButtonFromUI();
  closeStopDisplay();
  $('#activeSearchContainer').slideDown();
}

function closeSearchBoxContainer() {
  showSearchButtonFromUI();
  $('#activeSearchContainer').slideUp(250);
}

$(document).ready(function () {
    $('#activeSearchInput').on('keyup', function (event) {
        var searchValue = $('#activeSearchInput').val().toLowerCase();

        // Search value should be at least 2 characters long
        if (searchValue.length < 2) {
            $('#stopSearchResults').empty();
            return;
        }

        console.log("[search] Searching for:", searchValue);

        const stops = getStopsFromLocalStorage();
        var relevantStops = Object.keys(stops)
            .map(stopId => {
                const stopNameWithId = `${stopId} | ${stops[stopId].stop_name}`;
                if (stopNameWithId.toLowerCase().includes(searchValue)) {
                    return stopNameWithId;
                } 
            })
            .filter(stopNameWithId => stopNameWithId !== undefined);

        $('#stopSearchResults').empty();
        relevantStops.forEach(stopNameWithId => {
            const stopName = stopNameWithId.split(" | ")[1];
            const stopId = stopNameWithId.split(" | ")[0];

            const baseElement = document.createElement('div')
            baseElement.setAttribute('class', 'stopSearchResult');
            baseElement.setAttribute('data-stop-id', stopId);

            const stopNumberElement = document.createElement('span')
            stopNumberElement.setAttribute('class', 'stopNumber');
            stopNumberElement.textContent = stopId;

            const stopNameElement = document.createElement('span');
            stopNameElement.setAttribute('class', 'stopName');
            stopNameElement.textContent = stopName;

            baseElement.appendChild(stopNumberElement);
            baseElement.appendChild(stopNameElement);

            $('#stopSearchResults').append(baseElement);
        });
        console.log("[search] Found stops:", relevantStops);
    });


    $(document).on('click', '.stopSearchResult', function (event) {
        const stopId = $(this).data('stop-id');
        console.log("[search] Selected stop ID:", stopId);
        const stops = getStopsFromLocalStorage();
        const stop = stops[stopId];

        console.log("[search] Selected stop:", stop);

        // Center the map to the selected stop
        map.setView([stop.stop_lat, stop.stop_lon], 17);

        // Close the search box
        closeSearchBoxContainer();

        // Open the stop display
        openStopDisplay(stopId);
    });
});
