let latestDataPackage;
let vehicleInformation = {};

async function fetchLatestDataPackage() {
  return fetch('https://data.foli.fi/gtfs/')
    .then(response => response.json())
    .then(data => {
      latestDataPackage = data.latest;
    });
}
async function getAllVehicleInformation() {
  return fetch('https://data.foli.fi/siri/vm')
    .then(response => response.json())
}

async function getStops() {
  console.debug("[getStops] Fetching stops from API (sort of expensive operation)");
  return fetch(`https://data.foli.fi/gtfs/v0/${latestDataPackage}/stops`)
    .then(response => response.json())
}

async function getStopLiveDetails(stopId) {
  console.debug("[getStopLiveDetails] Fetching stop live details from API for stop ID:", stopId);
  return fetch(`https://data.foli.fi/siri/sm/${stopId}`)
    .then(response => response.json())
}

async function getTripDetails(tripId) {
  console.debug("[getTripDetails] Fetching trip details from API for trip ID:", tripId);
  return fetch(`https://data.foli.fi/gtfs/v0/${latestDataPackage}/trips/trip/${tripId}`)
    .then(response => response.json())
}

async function getTripShape(shapeId) {
  console.debug("[getTripShape] Fetching trip shape from API for shape ID:", shapeId);
  return fetch(`https://data.foli.fi/gtfs/v0/${latestDataPackage}/shapes/${shapeId}`)
    .then(response => response.json())
}

async function getAllVehicleLocations() {
  console.debug("[getAllVehicleLocations] Fetching all vehicle locations from API");
  return fetch(`https://data.foli.fi/siri/vp`)
    .then(response => response.json())
}

function updateVehicleLocationInfo() {
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
}
setInterval(() => {
  // todo only fetch if relevant
  updateVehicleLocationInfo();
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