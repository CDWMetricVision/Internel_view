function showDashboards() {
  window.location.href = "./dashboard.html";
}

function showMetrics() {
  window.location.href = "./metrics.html";
}

function showAlarms() {
  // Get the access token from sessionStorage
  let accessToken = sessionStorage.getItem("MetricVisionAccessToken");

  if (accessToken) {
    // Open the alarms page with the access token added in the URL as a query parameter
    window.location.href = `/alarm.html?access_token=${accessToken}`;
  } else {
    alert("Access token not found. Please sign in again.");
  }
}

function showLogs() {
    window.location.href = "./logs.html";
}

function toggleDarkMode() {
  document.getElementsByTagName("body")[0].classList.toggle("dark-mode");
}