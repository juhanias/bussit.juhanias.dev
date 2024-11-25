function hideStopAlertContainer() {
    $('#alertTitle').text();
    $('#alertMessage').text();
    $('#alertContainer').fadeOut();
}

function showStopAlertDetails() {
    $('#alertContainer').slideDown();
}

function closeStopDisplay() {
    hideStopAlertContainer();
    $('#stopDisplayContainer').slideUp();
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
    $('#stopDisplayContainer').slideDown();

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
                    <i style="color: snow">Ei lähteviä linjoja.</i>
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
                    <div class="stopLine">
                        <div class="stopLineId">${element.lineref}</div>
                        <div class="stopLineMetaData">
                            <div class="stopLineDestination">${element.destinationdisplay}</div>
                            <div class="stopLineBadges">
                                <span class="stopLineBadge ${isLate ? 'late' : ''}">
                                    ${isLate ? '' : '~'}${estimatedArrivalMinutes}m
                                </span>
                                ${nextEstimatedArrivalMinutes ? `
                                <span class="stopLineBadge">
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
