function onStopMarkerClick(stopNumber) {
    // Do something when the stop marker is clicked
    removeStopActiveSelection(getStopIdCurrentlyInFocus());
    
    openStopDisplay(stopNumber)
    closeSearchBoxContainer();
}