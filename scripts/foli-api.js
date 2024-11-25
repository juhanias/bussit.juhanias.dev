const hardCodedLatestDataPackage = "20241123-201425"

async function getAllVehicleInformation() {
  return fetch('https://data.foli.fi/siri/vm')
    .then(response => response.json())
}

async function getStops() {
  console.debug("[getStops] Fetching stops from API (sort of expensive operation)");
  return fetch(`https://data.foli.fi/gtfs/v0/${hardCodedLatestDataPackage}/stops`)
    .then(response => response.json())
}
