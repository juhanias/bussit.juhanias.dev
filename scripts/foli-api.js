const hardCodedLatestDataPackage = "20241123-201425"
let vehicleInformation = {};

async function getAllVehicleInformation() {
  return fetch('https://data.foli.fi/siri/vm')
    .then(response => response.json())
}

async function getStops() {
  console.debug("[getStops] Fetching stops from API (sort of expensive operation)");
  return fetch(`https://data.foli.fi/gtfs/v0/${hardCodedLatestDataPackage}/stops`)
    .then(response => response.json())
}

async function getStopLiveDetails(stopId) {
  console.debug("[getStopLiveDetails] Fetching stop live details from API for stop ID:", stopId);
  return fetch(`https://data.foli.fi/siri/sm/${stopId}`)
    .then(response => response.json())
}

async function getTripDetails(tripId) {
  console.debug("[getTripDetails] Fetching trip details from API for trip ID:", tripId);
  return fetch(`https://data.foli.fi/gtfs/v0/${hardCodedLatestDataPackage}/trips/trip/${tripId}`)
    .then(response => response.json())
}

async function getTripShape(shapeId) {
  console.debug("[getTripShape] Fetching trip shape from API for shape ID:", shapeId);
  return fetch(`https://data.foli.fi/gtfs/v0/${hardCodedLatestDataPackage}/shapes/${shapeId}`)
    .then(response => response.json())
}

async function getAllVehicleLocations() {
  console.debug("[getAllVehicleLocations] Fetching all vehicle locations from API");
  return fetch(`https://data.foli.fi/siri/vp`)
    .then(response => response.json())
}

setInterval(() => {
  // todo only fetch if relevant
  getAllVehicleInformation()
    .then(data => {
      vehicleInformation = data;

      Object.keys(vehicleInformation.result.vehicles)
        .map(key => {
          return vehicleInformation.result.vehicles[key];
        })
        .map(vehicle => {
          const vehicleRef = vehicle.vehicleref;
          
          // Check if locations of any live vehicle markers have changed
          const existingMarker = liveVehicleMarkers.find(marker => marker.options.vehicleRef === vehicleRef);

          if (existingMarker) {
            // Update existing marker
            existingMarker.setLatLng([vehicle.latitude, vehicle.longitude]);
          }
        });
    });
}, 4000);

function getAllVehiclesForPublishedLine(publishedLine) {
  console.debug("[getAllVehiclesForPublishedLine] Fetching all vehicles for published line:", publishedLine);
  const vehicles = Object.keys(vehicleInformation.result.vehicles)
  return vehicles
    .map(key => {
      return vehicleInformation.result.vehicles[key];
    })
    .filter(vehicle => vehicle.publishedlinename == publishedLine);
}