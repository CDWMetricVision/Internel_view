function showDashboards() {
  // Get the access token from sessionStorage
  let accessToken = sessionStorage.getItem("MetricVisionAccessToken");
  
  if (accessToken) {
      // Open the alarms page with the access token added in the URL as a query parameter
      window.location.href = `/dashboard.html?access_token=${accessToken}`;
  } else {
      alert('Access token not found. Please sign in again.');
  }
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
  const toggleBtn = document.querySelector(".toggle-btn2");

  if (document.body.classList.contains("dark-mode")) {
      toggleBtn.innerHTML = "☀️"; // Switch to sun
  } else {
      toggleBtn.innerHTML = "🌙"; // Switch to moon
  }
}
