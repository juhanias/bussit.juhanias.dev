var activelySelectedStop = null;

function hideStopAlertContainer() {
    $('#alertTitle').text();
    $('#alertMessage').text();
    $('#alertContainer').fadeOut();
}

function showStopAlertDetails() {
    $('#alertContainer').slideDown();
}

function closeStopDisplay() {
    $('#stopDisplayContainer').css('transition', 'none');

    hideStopAlertContainer();
    removeStopActiveSelection();
    $('#stopDisplayContainer').slideUp();
    $('#locateMeButton').css('bottom', '15px');
}

function setStopAlertDetails(alertDetails) {
    $('#alertTitle').text('Huomio!');
    $('#alertMessage').text(alertDetails.message);
}

function openStopDisplay(stopId) {
    const stopData = getStopById(stopId);
    console.log("[stop] Displaying stop:", stopData);
    
    $('#stopDisplayId').text(stopData.stop_code);
    $('#stopDisplayName').text(stopData.stop_name);
    $('#displayToggleFavoriteButton').attr('src', `icons/ic_fluent_star_24_regular${isStopFavorite(stopId) ? '_filled' : ''}.svg`);
    $('#stopDisplayContainer').slideDown(250, function () {
        $('#locateMeButton').css('bottom', 'calc(45% + 25px)');
    });

    getStopLiveDetails(stopId)
        .then(stopLiveDetails => {
            console.log("[stop] Live details for stop:", stopLiveDetails);
            $('#stopLines').empty();
            var placedLines = [];
        
            // Check if stop has active alerts
            if (stopLiveDetails.alerts && stopLiveDetails.alerts.length > 0) {
                setStopAlertDetails(stopLiveDetails.alerts[0]);

                // run after 1s
                setTimeout(() => {
                    showStopAlertDetails();
                }, 100);
            } else {
                hideStopAlertContainer();
            }

            
            $('#stopLines').append(`
                <i style="color: snow">Ladataan...</i>
            `);

            if (stopLiveDetails.result.length === 0) {
                $('#stopLines').empty();
                $('#stopLines').append(`
                    <i style="color: snow">Ei lähteviä linjoja seuraavien tuntien aikana.</i>
                `);
                return;
            } else {
                $('#stopLines').empty();
            }

            stopLiveDetails.result.forEach(element => {
                console.log("[stop] Line:", element);

                if (placedLines.includes(element.lineref)) {
                    return;
                }

                placedLines.push(element.lineref);
                const estimatedArrivalDate = new Date(element.expecteddeparturetime * 1000);
                const estimatedArrivalMinutes = Math.floor((estimatedArrivalDate - new Date()) / 60000);
                const nextLine = stopLiveDetails.result.find(line => line.lineref === element.lineref && line.expecteddeparturetime > element.expecteddeparturetime);

                var nextEstimatedArrivalDate;
                var nextEstimatedArrivalMinutes;

                if (nextLine) {
                    nextEstimatedArrivalDate = new Date(nextLine.expecteddeparturetime * 1000);
                    nextEstimatedArrivalMinutes = Math.floor((nextEstimatedArrivalDate - new Date()) / 60000);
                }

                const isLate = estimatedArrivalMinutes < 0;

                $('#stopLines').append(`
                    <div class="stopLine" data-lineref="${element.lineref}" data-tripref="${element.__tripref}">
                        <div class="stopLineId">${element.lineref}</div>
                        <div class="stopLineMetaData">
                            <div class="stopLineDestination">${element.destinationdisplay}</div>
                            <div class="stopLineBadges">
                                <span class="stopLineBadge ${isLate ? 'late' : ''}" data-estimated-departure="${estimatedArrivalDate.getTime()}" data-display-type="relative" data-indicator="next">
                                    ${isLate ? '' : '~'}${estimatedArrivalMinutes}m
                                </span>
                                ${nextEstimatedArrivalMinutes ? `
                                <span class="stopLineBadge" data-next-estimated-departure="${nextEstimatedArrivalDate.getTime()}" data-display-type="relative" data-indicator="after-next">
                                    Seuraava: ~${nextEstimatedArrivalMinutes}m
                                </span>` : ''}
                            </div>
                        </div>
                    </div>
                `);
            });
        }
    );
}

function getStopIdCurrentlyInFocus() {
    return $('#stopDisplayId').text();
}

function markStopAsActivelySelected(stopId) {;
    const marker = findMarkerByCoordinates(getStopById(stopId).stop_lat, getStopById(stopId).stop_lon);
    marker.setIcon(new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }));

    activelySelectedStop = stopId;
}

function removeStopActiveSelection() {
    const marker = findMarkerByStopId(activelySelectedStop);

    if (!marker) {
        return;
    }

    marker.setIcon(new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${isStopFavorite(activelySelectedStop) ? 'gold' : 'blue'}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }));
}

$(document).on('click', '.stopLineBadge', function (event) {
    event.stopPropagation();
    // Iterate over all elements with the class .stopLineBadge
    $('.stopLineBadge').each(function (index, element) {
        var $element = $(element); // Cache the jQuery object
        var type = $element.data('indicator');
        var displayType = $element.data('display-type');

        var estimatedDeparture = $element.data('estimated-departure');
        var nextEstimatedDeparture = $element.data('next-estimated-departure');

        var now = new Date().getTime();

        var timeRemaining = estimatedDeparture - now;
        var nextTimeRemaining = nextEstimatedDeparture - now;

        var newText;

        if (displayType === 'relative') {
            // Change to absolute
            $element.data('display-type', 'absolute');

            if (type === 'next') {
                newText = new Date(estimatedDeparture).toLocaleTimeString();
            } else if (type === 'after-next') {
                newText = 'Seuraava: ' + new Date(nextEstimatedDeparture).toLocaleTimeString();
            }
        } else if (displayType === 'absolute') {
            // Change to relative
            $element.data('display-type', 'relative');

            if (type === 'next') {
                newText = '~' + Math.floor(timeRemaining / 60000) + 'm';
            } else if (type === 'after-next') {
                newText = 'Seuraava: ~' + Math.floor(nextTimeRemaining / 60000) + 'm';
            }
        }

        // Animate the transition
        $element.fadeOut(200, function () {
            $element.text(newText); // Update text after fade out
            $element.fadeIn(200);  // Fade back in with new text
        });
    });
});

$(document).on('click', '.stopLine', function (event) {
    const tripRef = $(this).data('tripref');
    const lineRef = $(this).data('lineref');
    
    getTripDetails(tripRef)
        .then(tripDetails => {
            const shapeRef = tripDetails[0].shape_id;

            getTripShape(shapeRef)
                .then(tripShape => {
                    const polyline = L.polyline(tripShape.map(point => [point.lat, point.lon]), { color: '#fc9803' }).addTo(map);
                    map.fitBounds(polyline.getBounds());
                });

            getAllVehiclesForPublishedLine(lineRef).forEach(vehicle => {
                console.log("[stop] Vehicle:", vehicle);
                const marker = L.marker([vehicle.latitude, vehicle.longitude], {
                    icon: new L.Icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41],
                        className: 'vehicleMarker',
                      }),
                      vehicleRef: vehicle.vehicleref  
                })

                marker.addTo(map);

                liveVehicleMarkers.push(marker);    
                inSpecificRouteView = true;            
            });
        });
});