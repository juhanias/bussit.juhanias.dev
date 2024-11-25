function closeStopDisplay() {
    $('#stopDisplayContainer').slideUp();
}

function openStopDisplay(stopId) {
    const stopData = getStopById(stopId);
    console.log("[stop] Displaying stop:", stopData);
    
    $('#stopDisplayId').text(stopData.stop_code);
    $('#stopDisplayName').text(stopData.stop_name);
    $('#stopDisplayContainer').slideDown();
}
