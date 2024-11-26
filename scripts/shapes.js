function drawShapeOnMap() {
  fetch("https://data.foli.fi/gtfs/v0/20241123-201425/shapes/234")
    .then(response => response.json())
    .then(data => {
      const polyline = L.polyline(data.map(point => [point.lat, point.lon]), { color: 'blue' }).addTo(map);
      map.fitBounds(polyline.getBounds());
    });
}