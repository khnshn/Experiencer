function inputTime() {
  tau.openPopup("#time-popup");
  if (localStorage.hasOwnProperty("wakeup")) {
    $("#input-wakeup").val(localStorage.getItem("wakeup"));
  }
  if (localStorage.hasOwnProperty("sleep")) {
    $("#input-sleep").val(localStorage.getItem("sleep"));
  }
}
function saveTime() {
  console.log("save time");
  localStorage.setItem("wakeup", $("#input-wakeup").val().trim());
  localStorage.setItem("sleep", $("#input-sleep").val().trim());
  tau.closePopup("#time-popup");
}

// Function to calculate the distance between two points using the Haversine formula
function haversineDistance(lat1, long1, lat2, long2) {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180; // Latitude of point 1 in radians
  const φ2 = (lat2 * Math.PI) / 180; // Latitude of point 2 in radians
  const Δφ = ((lat2 - lat1) * Math.PI) / 180; // Difference in latitudes in radians
  const Δλ = ((long2 - long1) * Math.PI) / 180; // Difference in longitudes in radians

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
}

// Function to check if a point is within a circle
function isWithinCircle(centerLat, centerLong, pointLat, pointLong, radius) {
  console.log(
    "in isWithinCircle() with parameters " +
      centerLat +
      ", " +
      centerLong +
      ", " +
      pointLat +
      ", " +
      pointLong +
      ", " +
      radius
  );
  const distance = haversineDistance(
    centerLat,
    centerLong,
    pointLat,
    pointLong
  );
  return distance <= radius;
}
