async function getAllVehicleInformation() {
  return fetch('https://data.foli.fi/siri/vm')
    .then(response => response.json())
}