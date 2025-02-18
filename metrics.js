window.onload = () => {
  if (window.location.hash) {
    let hash = window.location.hash;
    let token = hash.split("access_token=")[1].split("&")[0];
    sessionStorage.setItem("MetricVisionAccessToken", token);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Prevent dropdown from closing when interacting with select elements
  document.querySelectorAll(".allMetrics").forEach((menu) => {
    menu.addEventListener("click", (e) => {
      e.stopPropagation(); // Stop the click from propagating and closing the dropdown
    });
  });
  displayTimeandDates();
});

function toggleSidePanel() {
  const sidePanel = document.getElementById("sidePanel");
  sidePanel.classList.toggle("active");
}

function accountsAndConnectInstancesObject() {
  return [
    {
      "MAS Sandbox Development": {
        connectInstances: {
          masdevelopment: "08aaaa8c-2bbf-4571-8570-f853f6b7dba0",
          masdevelopmentinstance2: "5c1408e0-cd47-4ba9-9b0c-c168752e2285",
        },
        baseAPIGatewayURL:
          "https://szw9nl20j5.execute-api.us-east-1.amazonaws.com/test",
      },
    },
    {
      "MAS Sandbox Test1": {
        connectInstances: {
          mastest1instance2: "921b9e21-6d50-4365-b861-297f61227bb8",
          mastest1: "cd54d26a-fee3-4645-87da-6acae50962a5",
        },
        baseAPIGatewayURL:
          "https://8vauowiu26.execute-api.us-east-1.amazonaws.com/test",
      },
    },
    {
      "MAS Sandbox Test2": {
        connectInstances: {
          mastest2instance2: "d8445c54-35f2-4e65-ab0f-9c98889bdb0c",
          mastest2: "ce2575a1-6ad8-4694-abd6-53acf392c698",
        },
        baseAPIGatewayURL:
          "https://9v5jzdmc6a.execute-api.us-east-1.amazonaws.com/test",
      },
    },
  ];
}

function selectClient(clientName) {
  const accountsSection = document.getElementById("accountsSection");
  accountsSection.style.display = "block";

  if (clientName === "MScloud") {
    populateMScloudAccounts();
  } else if (clientName === "CSK") {
    populateCSKAccounts();
  }
}

function removeSelection() {
    const accountsDropdown = document.getElementById("accountsDropdown").removeChild();
}

function populateMScloudAccounts() {
  const accountsDropdown = document.getElementById("accountsDropdown");
  accountsDropdown.innerHTML = `
        <button class="dropdown-item" onclick="selectAccount(event)">MScloud Account 1</button>
        <button class="dropdown-item" onclick="selectAccount(event)">MScloud Account 2</button>
    `;
}

function populateCSKAccounts() {
  const accountsDropdown = document.getElementById("accountsDropdown");
  accountsDropdown.innerHTML = `
        <button class="dropdown-item" onclick="selectAccount(event)">MAS Sandbox Development</button>
        <button class="dropdown-item" onclick="selectAccount(event)">MAS Sandbox Test1</button>
        <button class="dropdown-item" onclick="selectAccount(event)">MAS Sandbox Test2</button>
    `;
}

function selectAccount(event) {
  const connectInstances = document.getElementById("connectInstances");
  let instanceName = document.querySelector("#awsConnectInstanceName");
  instanceName.innerHTML = "";
  let finalAccountAndInstanceButton =
    document.querySelector("#getMetricsButton");
  finalAccountAndInstanceButton.disabled = true;
  let title = event.target.innerHTML;
  connectInstances.innerHTML = `
        <p class="mt-3 text-center w-100" id="awsAccountName">${title} Instances</p>
        <button class="btn btn-secondary dropdown-toggle w-100" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Instances</button>
        <div class="dropdown-menu instanceList"></div>
    `;

  $("#selected-account").text(title);

  const allAccountsList = accountsAndConnectInstancesObject();
  const instanceList = document.querySelector(".instanceList");

  instanceList.innerHTML = ""; // Clear previous instance list

  if (title.includes("MScloud")) {
    if (title === "MScloud Account 1") {
      instanceList.innerHTML = `
                <button class="dropdown-item connectInstance" onclick="selectInstance(event)" data-instance-id="MScloud1-instance1">MScloud1 Instance 1</button>
                <button class="dropdown-item connectInstance" onclick="selectInstance(event)" data-instance-id="MScloud1-instance2">MScloud1 Instance 2</button>
            `;
    } else if (title === "MScloud Account 2") {
      instanceList.innerHTML = `
                <button class="dropdown-item connectInstance" onclick="selectInstance(event)" data-instance-id="MScloud2-instance1">MScloud2 Instance 1</button>
                <button class="dropdown-item connectInstance" onclick="selectInstance(event)" data-instance-id="MScloud2-instance2">MScloud2 Instance 2</button>
            `;
    }
  } else {
    for (let account of allAccountsList) {
      const accountName = Object.keys(account)[0];
      if (accountName === title) {
        for (let [connectInstanceName, connectInstanceId] of Object.entries(
          account[accountName]["connectInstances"]
        )) {
          let button = document.createElement("button");
          button.classList.add("dropdown-item");
          button.classList.add("connectInstance");
          button.innerHTML = connectInstanceName;
          button.dataset.instanceId = connectInstanceId;
          button.dataset.baseApiUrl = account[accountName]["baseAPIGatewayURL"];
          button.addEventListener("click", selectInstance);
          instanceList.appendChild(button);
        }
      }
    }
  }
}

function selectInstance(event) {
  let instanceNameSpace = document.querySelector("#awsConnectInstanceName");
  let instanceId = event.target.dataset.instanceId;
  let apiUrl = event.target.dataset.baseApiUrl;
  instanceNameSpace.innerHTML = event.target.innerHTML;
  $("#selected-instance").text(event.target.innerHTML);
  let finalAccountAndInstanceButton =
    document.querySelector("#getMetricsButton");
  finalAccountAndInstanceButton.dataset.instanceId = instanceId;
  finalAccountAndInstanceButton.dataset.baseApiUrl = apiUrl;
  finalAccountAndInstanceButton.disabled = false;
}

function createNewAlarm() {
  alert("Creating a new alarm...");
}

function toggleDarkMode() {
  document.getElementsByTagName("body")[0].classList.toggle("dark-mode");
}

async function getARNQueryParams() {
  let queryString = window.location.search;
  let urlParams = new URLSearchParams(queryString);
  let instanceId = urlParams.get("instanceId");
  return {
    instanceId: instanceId,
  };
}

function sendInstanceId(event) {
  $("#results").empty();
  $("#sectionResults .loading").empty();
  let baseApiUrl = event.target.dataset.baseApiUrl;
  sessionStorage.setItem("baseApiUrl", baseApiUrl);
  let instanceId = event.target.dataset.instanceId;
  let url = new URL(window.location.href);
  url.searchParams.set("instanceId", instanceId);
  window.history.replaceState({}, "", url);
  getContactFlowNames();
  getQueueNames();
}

async function getQueueNames() {
  let baseURL = sessionStorage.getItem("baseApiUrl");
  let instanceId = await getARNQueryParams();
  let paramURL = `${baseURL}/queues/?instanceId=${instanceId["instanceId"]}`;
  try {
    let token = sessionStorage.getItem("MetricVisionAccessToken");
    let response = await fetch(paramURL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        let modalEl = document.querySelector("#signInAgainModal");
        let modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
      let failedResponse = await response.json();
      return {
        errorMessage: failedResponse,
        response: response,
        result: false,
      };
    } else {
      let queueNames = await response.json();
      let queueSelect = document.getElementById("queueSelect");
      queueSelect.innerHTML = `<option value="">Select a Queue</option>`;
      let queueMetricsOptions = document.getElementById("queueMetricsOptions");
      queueMetricsOptions.style.display = "none";
      queueNames.forEach((queue) => {
        const option = document.createElement("option");
        option.value = queue;
        option.textContent = queue;
        queueSelect.appendChild(option);
      });
      queueSelect.addEventListener("change", () => {
        if (queueSelect.value) {
          queueMetricsOptions.style.display = "block";
        } else {
          queueMetricsOptions.style.display = "none";
        }
      });
      sessionStorage.setItem("queueNames", queueNames);
      return {
        queueNames: queueNames,
        result: true,
      };
    }
  } catch (err) {
    console.log(err);
    return {
      errorMessage: err,
      result: false,
    };
  }
}

async function getContactFlowNames() {
  let baseURL = sessionStorage.getItem("baseApiUrl");
  let instanceId = await getARNQueryParams();
  let paramURL = `${baseURL}/contactFlows/?instanceId=${instanceId["instanceId"]}`;
  try {
    let token = sessionStorage.getItem("MetricVisionAccessToken");
    let response = await fetch(paramURL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        let modalEl = document.querySelector("#signInAgainModal");
        let modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
      let failedResponse = await response.json();
      return {
        errorMessage: failedResponse,
        response: response,
        result: false,
      };
    } else {
      let contactFlowNames = await response.json();
      let contactSelect = document.getElementById("contactSelect");
      contactSelect.innerHTML = `<option value="">Select a Contact</option>`;
      let contactMetricsOptions = document.getElementById(
        "contactMetricsOptions"
      );
      contactMetricsOptions.style.display = "none";
      contactFlowNames.forEach((contact) => {
        const option = document.createElement("option");
        option.value = contact;
        option.textContent = contact;
        contactSelect.appendChild(option);
      });
      contactSelect.addEventListener("change", () => {
        if (contactSelect.value) {
          contactMetricsOptions.style.display = "block";
        } else {
          contactMetricsOptions.style.display = "none";
        }
      });
      sessionStorage.setItem("contactFlowNames", contactFlowNames);
      return {
        contactFlowNames: contactFlowNames,
        result: true,
      };
    }
  } catch (err) {
    console.log(err);
    return {
      errorMessage: err,
      result: false,
    };
  }
}

async function customTimeFetchCloudWatchData(
  customStartTimeandDate,
  customEndTimeandDate,
  contactFlowName,
  queueName,
  individualMetrics,
  period = null
) {
  // let baseURL = "https://yfa9htwb2c.execute-api.us-east-1.amazonaws.com/testing/metrics";
  // let baseURL = "https://szw9nl20j5.execute-api.us-east-1.amazonaws.com/test/Any";
  let baseURL = sessionStorage.getItem("baseApiUrl");
  let customStartTimeParam = "";
  let customEndTimeParam = "";
  let contactFlowNameParam = "";
  let queueNameParam = "";
  let individualMetricsParam = "";
  let periodParam = "";
  if (customStartTimeandDate && customEndTimeandDate) {
    customStartTimeParam = `&customStartTimeandDate=${customStartTimeandDate}`;
    customEndTimeParam = `&customEndTimeandDate=${customEndTimeandDate}`;
  }
  if (contactFlowName) {
    contactFlowNameParam = `&contactFlowName=${contactFlowName}`;
  }
  if (queueName) {
    queueNameParam = `&queueName=${queueName}`;
  }
  if (individualMetrics) {
    individualMetricsParam = `&individualMetrics=${individualMetrics}`;
  }
  let arn = await getARNQueryParams();
  let paramURL = `${baseURL}/Any/?instanceId=${arn["instanceId"]}${customStartTimeParam}${customEndTimeParam}${contactFlowNameParam}${queueNameParam}${individualMetricsParam}`;
  if (period != null) {
    periodParam = `&metricPeriod=${period}`;
    paramURL = `${baseURL}/editMetric/?instanceId=${arn["instanceId"]}${customStartTimeParam}${customEndTimeParam}${contactFlowNameParam}${queueNameParam}${individualMetricsParam}${periodParam}`;
  }
  try {
    let token = sessionStorage.getItem("MetricVisionAccessToken");
    let response = await fetch(paramURL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        let modalEl = document.querySelector("#signInAgainModal");
        let modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
      let failedResponse = await response.json();
      return {
        errorMessage: failedResponse,
        response: response,
        result: false,
      };
    } else {
      let cloudWatchData = await response.json();
      sessionStorage.setItem("MetricVisionData", cloudWatchData);
      return {
        data: cloudWatchData,
        result: true,
      };
    }
  } catch (err) {
    console.log(err);
    return {
      errorMessage: err,
      result: false,
    };
  }
}

function cleanMetricName(metricName) {
  let cleanMetricName = metricName.replace(/_/g, " ").split(" ");
  cleanMetricName = cleanMetricName.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  return cleanMetricName.join(" ");
}

async function displayMetricTableData() {
  let loadingModal = document.createElement("p");
  loadingModal.innerHTML = "loading...";
  let sectionHeader = document.querySelector(".loading");
  sectionHeader.append(loadingModal);
  let data = await customTimeFetchCloudWatchData("", "");
  // let data = JSON.parse(sessionStorage.getItem("fakeMetricVisionData"))
  // console.log(data)
  if (!data.result) {
    sectionHeader.removeChild(loadingModal);
    let error = document.createElement("p");
    error.innerHTML = `Error: ${data.errorMessage.status}`;
    sectionHeader.appendChild(error);
    return;
  } else {
    sessionStorage.setItem(
      "MetricVisionData",
      JSON.stringify(data.data.MetricDataResults)
    );
    sectionHeader.removeChild(loadingModal);
    let metricDataResults = data.data.MetricDataResults.length;
    for (let i = 0; i < metricDataResults; i++) {
      createTableLineGauge(data.data.MetricDataResults[i]);
    }
    createIcons();
  }
}

function createTableLineGauge(data) {
  //make containers for each, then pass in container to each table, line graph, gauge, and icons
  let section;
  if ($("section#" + data.Id).length) {
    $("section#" + data.Id).empty();
    section = document.querySelector("section#" + data.Id);
  } else {
    let rowDiv = document.createElement("div");
    rowDiv.classList.add("row");
    section = document.createElement("section");
    section.classList.add("col-12");
    section.setAttribute("id", data.Id);
    let results = document.querySelector("#results");
    rowDiv.appendChild(section);
    results.appendChild(rowDiv);
  }
  if (data.Id.includes("percentage")) {
    data.Values.forEach(function (value, index) {
      data.Values[index] = Math.floor(value * 100);
    });
  }
  createLineGraphNew(data, section);
  createTable(data, section);
  createGauge(data, section);
}

function createIcons() {
  let tableIcon = document.createElement("i");
  tableIcon.classList.add(
    "tableChart",
    "fa-solid",
    "fa-table",
    "fa-xl",
    "icon"
  );
  let chartIcon = document.createElement("i");
  chartIcon.classList.add(
    "lineChart",
    "fa-solid",
    "fa-chart-line",
    "fa-xl",
    "icon"
  );
  let gaugeIcon = document.createElement("i");
  gaugeIcon.classList.add(
    "gaugeChart",
    "fa-solid",
    "fa-gauge",
    "fa-xl",
    "icon"
  );
  chartIcon.addEventListener("click", showLineCharts);
  tableIcon.addEventListener("click", showTables);
  gaugeIcon.addEventListener("click", showGauges);
  let selectWrapper = document.createElement("div");
  selectWrapper.classList.add("periodWrapper");
  let label = document.createElement("label");
  label.innerHTML = "Interval: ";

  let select = document.createElement("select");
  select.addEventListener("change", handlePeriodChange);
  select.setAttribute("disabled", true);
  let defaultOption = document.createElement("option");
  defaultOption.textContent = "Select";
  defaultOption.value = "";
  defaultOption.selected = true;
  defaultOption.disabled = true;
  select.appendChild(defaultOption);

  // Generate options from 5 to 20 in intervals of 5
  let dateFormat = [
    {
      value: 1,
      text: "1 Seconds",
    },
    {
      value: 5,
      text: "5 Seconds",
    },
    {
      value: 10,
      text: "10 Seconds",
    },
    {
      value: 60,
      text: "1 Minutes",
    },
    {
      value: 300,
      text: "5 Minutes",
    },
    {
      value: 900,
      text: "15 Minutes",
    },
    {
      value: 3600,
      text: "1 hours",
    },
    {
      value: 21600,
      text: "6 hours",
    },
    {
      value: 86400,
      text: "1 day",
    },
    {
      value: 604800,
      text: "7 days",
    },
    {
      value: 2592000,
      text: "30 days",
    },
  ];
  dateFormat.forEach((data) => {
    let option = document.createElement("option");
    option.value = data.value;
    option.textContent = data.text;
    select.appendChild(option);
  });
  selectWrapper.append(label, select);
  let editBtn = document.createElement("button");
  editBtn.innerHTML = "Edit";
  editBtn.classList.add("edit-btn");
  editBtn.addEventListener("click", handleEditBtn);
  const container = document.querySelector("#chart-edit-container");
  container.append(chartIcon, tableIcon, gaugeIcon, selectWrapper, editBtn);
}

function hideTables() {
  const tableCharts = document.querySelectorAll(".table-responsive");
  tableCharts.forEach((chart) =>
    chart.setAttribute("style", "display: none !important")
  );
}

function hideLineCharts() {
  const tableCharts = document.querySelectorAll(".line-chart");
  tableCharts.forEach((chart) =>
    chart.setAttribute("style", "display: none !important")
  );
}

function hideGauges() {
  const tableCharts = document.querySelectorAll(".guage-metric");
  tableCharts.forEach((chart) =>
    chart.setAttribute("style", "display: none !important")
  );
}

function showTables() {
  hideEveryMetrics();
  const tableCharts = document.querySelectorAll(".table-responsive");
  tableCharts.forEach((chart) =>
    chart.setAttribute("style", "display: block !important")
  );
}

function showLineCharts() {
  hideEveryMetrics();
  const tableCharts = document.querySelectorAll(".line-chart");
  tableCharts.forEach((chart) =>
    chart.setAttribute("style", "display: block !important")
  );
}

function showGauges() {
  hideEveryMetrics();
  const tableCharts = document.querySelectorAll(".guage-metric");
  tableCharts.forEach((chart) =>
    chart.setAttribute("style", "display: block !important")
  );
}

function hideEveryMetrics() {
  hideTables();
  hideLineCharts();
  hideGauges();
}

function hideOtherCharts(e) {
  let target = e.target.classList[0].replace("Chart", "");
  let parentNodeList = e.target.parentElement.childNodes;
  let section = [];
  for (i = 0; i < parentNodeList.length; i++) {
    if (parentNodeList[i].nodeName === "SECTION") {
      section.push(parentNodeList[i]);
    }
  }
  for (i = 0; i < section.length; i++) {
    if (section[i].id.includes(target)) {
      section[i].setAttribute("style", "display: block");
    } else {
      section[i].setAttribute("style", "display: none !important;");
    }
  }
}

async function handlePeriodChange(e) {
  const section = e.target.closest("section");
  if (!section) return;
  $("#loader").show();
  let periodIntervalVal = e.target.value * 60;
  let startDate = document.querySelector("#customStartDate").value;
  let endDate = document.querySelector("#customEndDate").value;
  let startTime = document.querySelector("#startTime").value;
  let endTime = document.querySelector("#endTime").value;
  let timezoneChoice = document.querySelector("#timezoneButton").innerHTML;
  let localTimezoneChoice = timezoneChoice.split(" ")[0];
  let formatterOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  let timezoneFormats = {
    Hawaii: "Pacific/Honolulu",
    Alaska: "America/Anchorage",
    Pacific: "America/Los_Angeles",
    Mountain: "America/Denver",
    Central: "America/Chicago",
    Eastern: "America/New_York",
    UTC: "UTC",
  };
  if (localTimezoneChoice != "Local") {
    formatterOptions.timeZone = timezoneFormats[localTimezoneChoice];
  }
  let startUTC = localDateToUTC(startDate, startTime);
  let endUTC = localDateToUTC(endDate, endTime);
  let data = await customTimeFetchCloudWatchData(
    startUTC,
    endUTC,
    "",
    "",
    section.id,
    periodIntervalVal
  );
  if (!data.result) {
    $("#loader").hide();
    sectionHeader.removeChild(loadingModal);
    let error = document.createElement("p");
    error.innerHTML = `Error: ${data.errorMessage.status}`;
    sectionHeader.appendChild(error);
    return;
  } else {
    $("#loader").hide();
    let metricDataResults = data.data.MetricDataResults.length;
    for (let i = 0; i < metricDataResults; i++) {
      if (data.data.MetricDataResults[i]["Timestamps"].length > 0) {
        let timestampsArray = data.data.MetricDataResults[i]["Timestamps"];
        for (let j = 0; j < timestampsArray.length; j++) {
          let formatter = new Intl.DateTimeFormat("en-US", formatterOptions);
          let UTCDate = timestampsArray[j] + " UTC";
          let UTCDateObject = new Date(UTCDate);
          let formattedDate = formatter.format(UTCDateObject);
          timestampsArray[j] = formattedDate;
        }
      }
    }
    for (let i = 0; i < metricDataResults; i++) {
      createTableLineGauge(data.data.MetricDataResults[i]);
    }
    createIcons();
  }
}

function handleEditBtn(e) {
  const select = document.querySelector(".periodWrapper select");
  if (select) {
    select.removeAttribute("disabled");
  }
}

function createGauge(data, container) {
  // create data set on our data
  let values = data["Values"];
  let min, max, avg, sum;
  if (data.Id.includes("percentage")) {
    min = 0;
    max = 100;
    sum = "N/A";
    if (values.length === 0) {
      avg = 0;
    } else if (values.every((value) => value === values[0])) {
      avg = parseFloat(
        (values.reduce((acc, num) => acc + num, 0) / values.length).toFixed(2)
      );
    } else {
      avg = parseFloat(
        (values.reduce((acc, num) => acc + num, 0) / values.length).toFixed(2)
      );
    }
  } else if (data.Id.includes("packet_loss")) {
    min = 0;
    max = 100;
    sum = "N/A";
    if (values.length === 0) {
      avg = 0;
    } else if (values.every((value) => value === values[0])) {
      avg = parseFloat(
        (values.reduce((acc, num) => acc + num, 0) / values.length).toFixed(2)
      );
    } else {
      avg = parseFloat(
        (values.reduce((acc, num) => acc + num, 0) / values.length).toFixed(2)
      );
    }
  } else {
    if (values.length === 0) {
      min = 0;
      max = 1;
      sum = 0;
      avg = 0;
    } else if (values.every((value) => value === values[0])) {
      min = Math.min(0, values[0]);
      max = values[0] + 1;
      sum = values.reduce((acc, num) => acc + num, 0);
      avg = values[0];
    } else {
      min = Math.min(...values);
      max = Math.max(...values);
      sum = values.reduce((acc, num) => acc + num, 0);
      avg = parseFloat((sum / values.length).toFixed(2));
    }
  }
  let dataSet = anychart.data.set([avg]); //Where to set avg value!!
  // set the gauge type
  let gauge = anychart.gauges.circular();
  // link the data with the gauge
  gauge.data(dataSet);
  //set the starting angle for the gauge
  gauge.startAngle(270);
  //set the angle limit for the gauge
  gauge.sweepAngle(180);
  let axis = gauge.axis().radius(95).width(1);

  axis
    .scale()
    .minimum(min) //Where to set Min and Max!!
    .maximum(max); //Where to set Min and Max!!

  axis.ticks().enabled(true).type("line").length("8");

  gauge.range({
    from: min, //Also where to set min!!
    to: max, //Also where to set the max!!
    fill: { keys: ["green", "yellow", "orange", "red"] },
    position: "inside",
    radius: 100,
    endSize: "3%",
    startSize: "3%",
    zIndex: 10,
  });
  gauge.fill("lightblue", 0.3);

  gauge
    .needle(0)
    .enabled(true)
    .startRadius("-5%")
    .endRadius("60%")
    .middleRadius(0)
    .startWidth("0.05%")
    .endWidth("0.05%")
    .middleWidth("2%");

  // draw the chart
  let section = document.createElement("section");
  section.classList.add(
    "flex-grow-1",
    "d-flex",
    "justify-content-around",
    "flex-wrap",
    "align-items-center",
    "guage-metric"
  );
  section.setAttribute("Id", `gauge_${data.Id}`);

  //metric name column
  let metricNameDiv = document.createElement("div");
  metricNameDiv.classList.add("d-flex", "flex-column", "text-center", "mx3");
  let metricNameTextDiv = document.createElement("b");
  metricNameTextDiv.innerHTML = cleanMetricName(data.Id);
  metricNameDiv.appendChild(metricNameTextDiv);

  //Min and Max columns
  let minMaxDiv = document.createElement("div");
  minMaxDiv.classList.add("d-flex", "flex-column", "text-center", "mx3");
  let minDiv = document.createElement("div");
  let minLabelDiv = document.createElement("div");
  let maxDiv = document.createElement("div");
  let maxLabelDiv = document.createElement("div");
  minDiv.innerHTML = min;
  minLabelDiv.innerHTML = "Minimum";
  maxDiv.innerHTML = max;
  maxLabelDiv.innerHTML = "Maximum";
  minMaxDiv.append(minDiv, minLabelDiv, maxDiv, maxLabelDiv);

  //Avg and Sum Columns
  let avgSumDiv = document.createElement("div");
  avgSumDiv.classList.add("d-flex", "flex-column", "text-center", "mx3");
  let avgDiv = document.createElement("div");
  let avgLabelDiv = document.createElement("div");
  let sumDiv = document.createElement("div");
  let sumLabelDiv = document.createElement("div");
  avgDiv.innerHTML = avg;
  avgLabelDiv.innerHTML = "Average";
  sumDiv.innerHTML = sum;
  sumLabelDiv.innerHTML = "Sum";
  avgSumDiv.append(avgDiv, avgLabelDiv, sumDiv, sumLabelDiv);

  section.append(metricNameDiv, minMaxDiv, avgSumDiv);

  let gaugeDiv = document.createElement("div");
  let containerId = `guage_${data.Id}_container`;
  gaugeDiv.setAttribute("id", containerId);
  gauge.container(gaugeDiv).draw();
  section.append(gaugeDiv);
  section.setAttribute("style", "display: none !important");
  container.append(section);
}

function createLineGraphNew(data, container) {
  let metric = data.Id;
  let chartMetricData = [];
  for (let i = 0; i < data["Timestamps"].length; i++) {
    let chartData = [];
    if (metric === "to_instance_packet_loss_rate") {
      chartData.push(data["Timestamps"][i], data["Values"][i].toFixed(3));
      chartMetricData.push(chartData);
      continue;
    } else {
      chartData.push(data["Timestamps"][i], data["Values"][i]);
      chartMetricData.push(chartData);
    }
  }
  let graphData = {
    title: metric,
    xAxis: "Interval",
    yAxis: metric,
    data: chartMetricData,
  };
  chartLineGraph(graphData, container);
}

function chartLineGraph(graphData, container) {
  let { title, xAxis, yAxis, data } = graphData;
  let chart = anychart.line();
  chart.data(data);
  chart.title(cleanMetricName(title));

  // Step 5: Customize axes
  chart.xAxis().title(xAxis);

  let flexDiv = document.createElement("section");
  flexDiv.classList.add("flex-grow-1");
  let flexDivId = `lineChart_${title}`;
  flexDiv.setAttribute("id", flexDivId);
  flexDiv.setAttribute("class", "line-chart");

  // Step 6: Display the chart
  chart.container(flexDiv);
  chart.draw();
  container.appendChild(flexDiv);
}

function createTable(data, container) {
  let metricLabel = cleanMetricName(data.Id);
  let tableWrapper = document.createElement("section");
  tableWrapper.setAttribute("class", "table-responsive");
  tableWrapper.setAttribute("id", `table_${data.Id}`);
  let table = document.createElement("table");
  table.setAttribute("class", "table");
  let tableHead = document.createElement("thead");
  let headerRow = document.createElement("tr");
  tableHead.appendChild(headerRow);
  let tableRowMetricName = document.createElement("th");
  tableRowMetricName.setAttribute("scope", "col");
  tableRowMetricName.setAttribute("style", "text-decoration: underline;");
  tableRowMetricName.innerHTML = "Metric Name";
  headerRow.appendChild(tableRowMetricName);
  data.Timestamps.forEach((timestamp) => {
    let header = document.createElement("th");
    header.setAttribute("scope", "col");
    header.innerHTML = timestamp;
    headerRow.appendChild(header);
  });
  table.appendChild(tableHead);
  tableWrapper.appendChild(table);

  let tableBody = document.createElement("tbody");
  let columnRow = document.createElement("tr");
  tableBody.appendChild(columnRow);
  table.appendChild(tableBody);
  let rowHeader = document.createElement("th");
  rowHeader.setAttribute("scope", "row");
  rowHeader.innerHTML = metricLabel;
  columnRow.appendChild(rowHeader);
  if (data.Id.includes("percentage")) {
    data.Values.forEach((value) => {
      let row = document.createElement("td");
      row.innerHTML = value + "%";
      columnRow.appendChild(row);
    });
  } else if (data.Id.includes("packet_loss")) {
    data.Values.forEach((value) => {
      let row = document.createElement("td");
      row.innerHTML = value.toFixed(3) + "%";
      columnRow.appendChild(row);
    });
  } else {
    data.Values.forEach((value) => {
      let row = document.createElement("td");
      row.innerHTML = value;
      columnRow.appendChild(row);
    });
  }
  table.appendChild(tableBody);
  tableWrapper.setAttribute("style", "display: none !important");
  container.appendChild(tableWrapper);
}

function selectAllConnectMetrics(event) {
  let instanceMetricsCheckboxes =
    document.querySelectorAll(".instance-metrics");
  instanceMetricsCheckboxes.forEach((checkbox) => {
    checkbox.checked = event.target.checked;
  });
}

function chooseMetrics(event) {
  let individualMetricsList = [];
  let contactName = "";
  let queueName = "";
  let instanceMetricsCheckboxes =
    document.querySelectorAll(".instance-metrics");
  let contactMetricsCheckboxes = document.querySelectorAll(".contact-metrics");
  let contactNameDropdown = document.querySelector("#contactSelect");
  let queueNameDropdown = document.querySelector("#queueSelect");
  let queueMetricsCheckboxes = document.querySelectorAll(".queue-metrics");
  instanceMetricsCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      individualMetricsList.push(checkbox.id);
    }
  });
  contactMetricsCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      individualMetricsList.push(checkbox.id);
      contactName = contactNameDropdown.value;
    }
  });
  queueMetricsCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      individualMetricsList.push(checkbox.id);
      queueName = queueNameDropdown.value;
    }
  });
  let individualMetricsString = individualMetricsList.toString();
  return {
    individualMetricsString: individualMetricsString,
    contactName: contactName,
    queueName: queueName,
  };
}

async function submitCustomDateTimeframe() {
  let startDate = document.querySelector("#customStartDate").value;
  let endDate = document.querySelector("#customEndDate").value;
  let startTime = document.querySelector("#startTime").value;
  let endTime = document.querySelector("#endTime").value;
  let timezoneChoice = document.querySelector("#timezoneButton").innerHTML;
  let chosenMetrics = chooseMetrics();
  let metricsInput = document.querySelector("#metricsInput");
  if (
    startDate &&
    endDate &&
    startTime &&
    endTime &&
    chosenMetrics.individualMetricsString
  ) {
    metricsInput.innerHTML = "";
  } else {
    metricsInput.setAttribute("style", "color: red;");
    metricsInput.innerHTML =
      "Please select a start time and date, an end time and date, and at least 1 metric from the dropdown";
    return;
  }
  let localTimezoneChoice = timezoneChoice.split(" ")[0];
  let formatterOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  let timezoneFormats = {
    Hawaii: "Pacific/Honolulu",
    Alaska: "America/Anchorage",
    Pacific: "America/Los_Angeles",
    Mountain: "America/Denver",
    Central: "America/Chicago",
    Eastern: "America/New_York",
    UTC: "UTC",
  };
  if (localTimezoneChoice != "Local") {
    formatterOptions.timeZone = timezoneFormats[localTimezoneChoice];
  }
  let startUTC = localDateToUTC(startDate, startTime);
  let endUTC = localDateToUTC(endDate, endTime);
  let loadingModal = document.createElement("p");
  loadingModal.innerHTML = "loading . . .";
  $("#sectionResults .loading").empty();
  let sectionHeader = document.querySelector(".loading");
  sectionHeader.append(loadingModal);
  let data = await customTimeFetchCloudWatchData(
    startUTC,
    endUTC,
    chosenMetrics["contactName"],
    chosenMetrics["queueName"],
    chosenMetrics["individualMetricsString"]
  );
  // let data = JSON.parse(sessionStorage.getItem("fakeMetricVisionData"))
  if (!data.result) {
    sectionHeader.removeChild(loadingModal);
    let error = document.createElement("p");
    error.innerHTML = `Error: ${data.response.status}\n ${data.errorMessage.message}`;
    sectionHeader.appendChild(error);
    return;
  } else {
    for (let i = 0; i < data.data.MetricDataResults.length; i++) {
      if (data.data.MetricDataResults[i]["Timestamps"].length > 0) {
        let timestampsArray = data.data.MetricDataResults[i]["Timestamps"];
        for (let j = 0; j < timestampsArray.length; j++) {
          let formatter = new Intl.DateTimeFormat("en-US", formatterOptions);
          let UTCDate = timestampsArray[j] + " UTC";
          let UTCDateObject = new Date(UTCDate);
          let formattedDate = formatter.format(UTCDateObject);
          timestampsArray[j] = formattedDate;
        }
      }
    }
    sessionStorage.setItem(
      "MetricVisionData",
      JSON.stringify(data.data.MetricDataResults)
    );
    sectionHeader.removeChild(loadingModal);
    let results = document.querySelector("#results");
    results.remove();
    let newResults = document.querySelector("#dataTables");
    let section = document.createElement("div");
    section.setAttribute("id", "results");
    newResults.appendChild(section);
    let metricDataResults = data.data.MetricDataResults.length;
    for (let i = 0; i < metricDataResults; i++) {
      createTableLineGauge(data.data.MetricDataResults[i]);
    }
    createIcons();
  }
}

function refreshDropdownChoice(event) {
  let refreshDropdownButton = document.querySelector("#autoRefreshButton");
  refreshDropdownButton.innerHTML = `<i class="fa-solid fa-arrows-rotate fa-lg"></i> ${event.target.innerHTML}`;
  if (refreshDropdownButton.dataset.intervalId) {
    clearInterval(refreshDropdownButton.dataset.intervalId);
    refreshDropdownButton.dataset.intervalId = "";
  }
  if (event.target.innerHTML === "Off") {
    return;
  }
  let timeAmount = event.target.innerHTML.split(" ")[0];
  let milliseconds = parseInt(timeAmount) * 60 * 1000;
  let currentDate = new Date();
  function formatDate(date) {
    const year = date.getFullYear();
    let month = date.getMonth() + 1; // Months are 0-based
    let day = date.getDate();

    // Pad month and day with leading zeros if necessary
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;

    return `${year}-${month}-${day}`;
  }

  // Helper function to format time to HH:MM
  function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Pad hours and minutes with leading zeros if necessary
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return `${hours}:${minutes}`;
  }

  // Get the current formatted date and time

  //Now basically make a set timeout function, that for every value of the seconds variable, which is what client selected from dropdown, take all values of times,
  //dates, timezone, and metrics, and do a fetch request, then call the display graphs
  let intervalId = setInterval(async () => {
    const currentFormattedDate = formatDate(currentDate);
    const currentFormattedTime = formatTime(currentDate);
    let endDate = document.querySelector("#customEndDate");
    let endTime = document.querySelector("#endTime");
    endDate.value = currentFormattedDate;
    endTime.value = currentFormattedTime;

    let startDate = document.querySelector("#customStartDate").value;
    let startTime = document.querySelector("#startTime").value;
    let timezoneChoice = document.querySelector("#timezoneButton").innerHTML;
    let chosenMetrics = chooseMetrics();
    let localTimezoneChoice = timezoneChoice.split(" ")[0];
    let formatterOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    let timezoneFormats = {
      Hawaii: "Pacific/Honolulu",
      Alaska: "America/Anchorage",
      Pacific: "America/Los_Angeles",
      Mountain: "America/Denver",
      Central: "America/Chicago",
      Eastern: "America/New_York",
      UTC: "UTC",
    };
    if (localTimezoneChoice != "Local") {
      formatterOptions.timeZone = timezoneFormats[localTimezoneChoice];
    }
    let startUTC = localDateToUTC(startDate, startTime);
    let endUTC = localDateToUTC(currentFormattedDate, currentFormattedTime);
    let loadingModal = document.createElement("p");
    loadingModal.innerHTML = "loading . . .";
    $("#sectionResults .loading").empty();
    let sectionHeader = document.querySelector(".loading");
    sectionHeader.append(loadingModal);
    let data = await customTimeFetchCloudWatchData(
      startUTC,
      endUTC,
      chosenMetrics["contactName"],
      chosenMetrics["queueName"],
      chosenMetrics["individualMetricsString"]
    );
    if (!data.result) {
      sectionHeader.removeChild(loadingModal);
      let error = document.createElement("p");
      error.innerHTML = `Error: ${data.errorMessage.status}`;
      sectionHeader.appendChild(error);
      return;
    } else {
      for (let i = 0; i < data.data.MetricDataResults.length; i++) {
        if (data.data.MetricDataResults[i]["Timestamps"].length > 0) {
          let timestampsArray = data.data.MetricDataResults[i]["Timestamps"];
          for (let j = 0; j < timestampsArray.length; j++) {
            let formatter = new Intl.DateTimeFormat("en-US", formatterOptions);
            let UTCDate = timestampsArray[j] + " UTC";
            let UTCDateObject = new Date(UTCDate);
            let formattedDate = formatter.format(UTCDateObject);
            timestampsArray[j] = formattedDate;
          }
        }
      }
      sessionStorage.setItem(
        "MetricVisionData",
        JSON.stringify(data.data.MetricDataResults)
      );
      sectionHeader.removeChild(loadingModal);
      let results = document.querySelector("#results");
      results.remove();
      let newResults = document.querySelector("#dataTables");
      let section = document.createElement("div");
      section.setAttribute("id", "results");
      newResults.appendChild(section);
      let metricDataResults = data.data.MetricDataResults.length;
      for (let i = 0; i < metricDataResults; i++) {
        createTableLineGauge(data.data.MetricDataResults[i]);
      }
      createIcons();
    }
  }, milliseconds);
  refreshDropdownButton.dataset.intervalId = intervalId;
}

function displayTimeandDates() {
  let startTime = document.querySelector("#startTime");
  let endTime = document.querySelector("#endTime");
  let startDate = document.querySelector("#customStartDate");
  let endDate = document.querySelector("#customEndDate");
  let { currentDate, currentTime, twoWeeksAgoDate, twoWeeksAgoTime } =
    getFormattedDates();
  startTime.value = twoWeeksAgoTime;
  startDate.value = twoWeeksAgoDate;
  endTime.value = currentTime;
  endDate.value = currentDate;
}

function getFormattedDates() {
  // Get the current date
  const currentDate = new Date();

  // Helper function to format date to YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    let month = date.getMonth() + 1; // Months are 0-based
    let day = date.getDate();

    // Pad month and day with leading zeros if necessary
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;

    return `${year}-${month}-${day}`;
  }

  // Helper function to format time to HH:MM
  function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Pad hours and minutes with leading zeros if necessary
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return `${hours}:${minutes}`;
  }

  // Get the current formatted date and time
  const currentFormattedDate = formatDate(currentDate);
  const currentFormattedTime = formatTime(currentDate);

  // Get the date 2 weeks ago
  const twoWeeksAgoDate = new Date(currentDate);
  twoWeeksAgoDate.setDate(currentDate.getDate() - 14);

  // Get the formatted date and time for 2 weeks ago
  const twoWeeksAgoFormattedDate = formatDate(twoWeeksAgoDate);
  const twoWeeksAgoFormattedTime = formatTime(twoWeeksAgoDate);

  return {
    currentDate: currentFormattedDate,
    currentTime: currentFormattedTime,
    twoWeeksAgoDate: twoWeeksAgoFormattedDate,
    twoWeeksAgoTime: twoWeeksAgoFormattedTime,
  };
}

function timezoneDropdownChoice(event) {
  let timezoneDropdownButtonText = document.querySelector("#timezoneButton");
  timezoneDropdownButtonText.innerHTML = event.target.innerHTML;
}

function localDateToUTC(rawDateInput, rawTimeInput) {
  let [year, month, day] = rawDateInput.split("-");
  month = parseInt(month) - 1;
  let [hours, minutes] = rawTimeInput.split(":");
  let UTCDate = new Date(year, month, day, hours, minutes).toISOString();
  return UTCDate;
}


function accountsAndConnectInstancesObject() {
  const allAccountsList = [
    {
      "MAS Sandbox Development": {
        connectInstances: {
          masdevelopment: "08aaaa8c-2bbf-4571-8570-f853f6b7dba0",
          masdevelopmentinstance2: "5c1408e0-cd47-4ba9-9b0c-c168752e2285",
        },
        baseAPIGatewayURL:
          "https://szw9nl20j5.execute-api.us-east-1.amazonaws.com/test",
      },
    },
    {
      "MAS Sandbox Test1": {
        connectInstances: {
          mastest1instance2: "921b9e21-6d50-4365-b861-297f61227bb8",
          mastest1: "cd54d26a-fee3-4645-87da-6acae50962a5",
        },
        baseAPIGatewayURL:
          "https://8vauowiu26.execute-api.us-east-1.amazonaws.com/test",
      },
    },
    {
      "MAS Sandbox Test2": {
        connectInstances: {
          mastest2instance2: "d8445c54-35f2-4e65-ab0f-9c98889bdb0c",
          mastest2: "ce2575a1-6ad8-4694-abd6-53acf392c698",
        },
        baseAPIGatewayURL:
          "https://9v5jzdmc6a.execute-api.us-east-1.amazonaws.com/test",
      },
    },
  ];
  return allAccountsList;
}
