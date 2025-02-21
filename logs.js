let logsData = [];
let logGroupSelected = 0;

function getAccountsAlarmsAPI() {
  const allAccountsAlarmsList = [
    {
      "MAS Sandbox Development": {
        cloudWatchAPI:
          "https://szw9nl20j5.execute-api.us-east-1.amazonaws.com/test/getalarm",
      },
    },
    {
      "MAS Sandbox Test1": {
        cloudWatchAPI:
          "https://8vauowiu26.execute-api.us-east-1.amazonaws.com/test/getalarm",
      },
    },
    {
      "MAS Sandbox Test2": {
        cloudWatchAPI:
          "https://9v5jzdmc6a.execute-api.us-east-1.amazonaws.com/test/getalarm",
      },
    },
  ];
  return allAccountsAlarmsList;
}

function clientChange(event) {
  const clientName = event.target.value;
  document
    .querySelector(".accounts-input-wrapper")
    .setAttribute("style", "display:block");
  if (clientName === "MScloud") {
    populateMScloudAccounts();
  } else if (clientName === "CSK") {
    populateCSKAccounts();
  }
  document.querySelector("#logs").removeAttribute("disabled");
}

function removeSelection() {
  document.getElementById("accountsDropdown").innerHTML = "";
}

function populateMScloudAccounts() {
  removeSelection();
  const accountsDropdown = document.getElementById("accountsDropdown");
  accountsDropdown.innerHTML = `
        <option value="MScloud Account 1">MScloud Account 1</option>
        <option value="MScloud Account 2">MScloud Account 2</option>
    `;
}

function populateCSKAccounts() {
  removeSelection();
  const accountsDropdown = document.getElementById("accountsDropdown");
  accountsDropdown.innerHTML = `
        <option value="MAS Sandbox Development">MAS Sandbox Development</option>
        <option value="MAS Sandbox Test1">MAS Sandbox Test1</option>
        <option value="MAS Sandbox Test2">MAS Sandbox Test2</option>
    `;
}

function customerAccountChange(event) {
  $("#getAlarmsData").attr("disabled", false);
}
function createTable(alarms) {
  const table = $("#alarmsList table");

  // Clear existing table content
  table.empty();

  // Create table header
  const headers = Object.keys(alarms[0]);
  let headerHtml = "<thead><tr>";

  headers.forEach((headerText) => {
    headerHtml += `<th>${headerText}</th>`;
  });

  headerHtml += "</tr></thead>";
  table.append(headerHtml);

  // Create table body
  let bodyHtml = "<tbody>";

  alarms.forEach((alarm) => {
    bodyHtml += "<tr>";
    headers.forEach((header) => {
      console.log(alarm[header].toLowerCase());
      if (
        header.toLowerCase() === "state" &&
        alarm[header].toLowerCase() === "in alarm"
      ) {
        bodyHtml += `<td class="red">${alarm[header]}</td>`;
      } else {
        bodyHtml += `<td>${alarm[header]}</td>`;
      }
    });
    bodyHtml += "</tr>";
  });

  bodyHtml += "</tbody>";
  table.append(bodyHtml);
}

async function getAlarmsData() {
  input = $("#customerAccounts").val();
  const accounts = getAccountsAlarmsAPI();

  let apiURL = accounts
    .filter((account) => account[input])
    .map((account) => account[input].cloudWatchAPI)[0];
  try {
    await fetch(apiURL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const body = JSON.parse(data.body); // Parse the body string into an array of objects
        console.log(body);
        createTable(body);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  } catch (err) {
    console.log(err);
  }
}

function showLoader() {
  document.querySelector("#loader").setAttribute("style", "display: flex");
}
function hideLoader() {
  document.querySelector("#loader").setAttribute("style", "display: none");
}

async function getLogs() {
  // "https://szw9nl20j5.execute-api.us-east-1.amazonaws.com/test/logs" - initial
  // https://8vauowiu26.execute-api.us-east-1.amazonaws.com/test/getlogs - test 1
  // "https://9v5jzdmc6a.execute-api.us-east-1.amazonaws.com/test/getlogs" - test 2
  
  showLoader();
  
  const logsURL =
    "https://9v5jzdmc6a.execute-api.us-east-1.amazonaws.com/test/getlogs";
  try {
    let token = sessionStorage.getItem("MetricVisionAccessToken");
    let response = await fetch(logsURL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        window.alert("authentication failed, please re-login!");

        // let modalEl = document.querySelector("#signInAgainModal");
        // let modal = new bootstrap.Modal(modalEl);
        // modal.show();
      }
      let failedResponse = await response.json();
      console.log("error in api", response);
      return {
        errorMessage: failedResponse,
        response: response,
        result: false,
      };
    } else {
      response = await response.json();
      let logs = JSON.parse(response.body);
      document.querySelector("#log-groups tbody").innerHTML="";
      populateLogs(logs);
    }
  } catch (err) {
    console.log("error in getting logs", err);
    alert("error from logs api");
  } finally {
    hideLoader();
  }
}

function populateLogs(logResponse) {
  const contentArea = document.querySelector("#log-groups tbody");
  logsData = logResponse;
  logResponse.forEach((log, index) => {
    let row = document.createElement("tr");
    row.innerHTML = `<td>${
      index + 1
    }</td><td><a href="#" class="text-log-group" onclick="displayLogGroup(${index})">${
      log.logGroupName
    }</a></td>`;
    contentArea.appendChild(row);
  });
  document.querySelector(".logs-result-section").setAttribute("style", "display: block");
  document.querySelector("#logs-container").setAttribute("style", "display: block");
}

function displayLogGroup(logDataIndex) {
  logGroupSelected = logDataIndex;
  const log = logsData[logDataIndex];
  displayLogStreamsContainer(log.logGroupName)
}

function displayLogStreamsContainer(logGroupName) {
  document
    .querySelector("#logs-container")
    .setAttribute("style", "display:none");
  document.querySelector("#logs-data-container").setAttribute("style", "display: block");
  document.querySelector("#logs-header").innerHTML = `
    <h5 class="default-header pr-2" onclick="resetLogs()">Log Groups</h5>
    <h5>> ${logGroupName}</h5>
  `;
}

function resetLogs() {
  logGroupSelected = null;
  document.querySelector("#logs-header").innerHTML='<h5 class="default-header">Log Groups</h5>';
  document.querySelector("#logs-container").setAttribute("style", "display:block");
  resetLogStreams();
}

function resetLogStreams() {
  document.querySelector(".accordian-icon").innerHTML = ">";
  document
    .querySelector(".livelogs-content")
    .setAttribute("style", "display:none");
  document
    .querySelector("#logs-data-container")
    .setAttribute("style", "display:none");
}

function showLogStreams(event) {
  const target = event.target;
  const icon = target.querySelector(".accordian-icon");

  if(icon.textContent == ">") {
    icon.innerHTML = "v";
    document
      .querySelector(".streams-content")
      .setAttribute("style", "display: block");
  } else {
    icon.innerHTML = ">";
    document.querySelector(".streams-content").setAttribute("style", "display: none");
    return;
  }

  const log = logsData[logGroupSelected];
  if (!log.logStreams.length) {
    document.querySelector(".streams-content").innerHTML =
      "Live log is empty!";
    return;
  }
  document.querySelector(".streams-content").innerHTML = "";
  log.logStreams.forEach(stream => {
    let content = document.createElement('pre');
    content.innerHTML = `<code class="language-json" id="jsonDisplay">${JSON.stringify(stream, null, 2)}</code>`;
    document.querySelector(".streams-content").appendChild(content);
  });
}

function showLiveLogs(event) {
  const target = event.target;
  const icon = target.querySelector(".accordian-icon");
  if ((icon.textContent == ">")) {
    icon.innerHTML = "v";
    document
      .querySelector(".livelogs-content")
      .setAttribute("style", "display: block");
  } else {
    icon.innerHTML = ">";
    document
      .querySelector(".livelogs-content")
      .setAttribute("style", "display: none");
    return;
  }

  const log = logsData[logGroupSelected];

  if(!log.liveLogs.length) {
    document.querySelector(".livelogs-content").innerHTML="Live log is empty!";
    return;
  }
  document.querySelector(".livelogs-content").innerHTML = "";
  log.liveLogs.forEach((stream) => {
    let content = document.createElement("pre");
    content.innerHTML = `<code class="language-json" id="jsonDisplay">${JSON.stringify(
      stream,
      null,
      2
    )}</code>`;
    document.querySelector(".livelogs-content").appendChild(content);
  });
}
