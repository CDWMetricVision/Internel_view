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
  
  function toggleDarkMode() {
    document.getElementsByTagName("body")[0].classList.toggle("dark-mode");
  }
  function getDashboardsAPI() {
    const savedDashboardsAPI = [
        {
            "MAS Sandbox Development":"https://szw9nl20j5.execute-api.us-east-1.amazonaws.com/test",
        },
        {
            "MAS Sandbox Test1":"https://8vauowiu26.execute-api.us-east-1.amazonaws.com/test",
        },
        {
            "MAS Sandbox Test2":"https://9v5jzdmc6a.execute-api.us-east-1.amazonaws.com/test",
        }
    ]
    return savedDashboardsAPI;
}
function accountsAndConnectInstancesObject() {
    const allAccountsList = [
        {
            "MAS Sandbox Development": {
                "connectInstances": {
                    "masdevelopment": "08aaaa8c-2bbf-4571-8570-f853f6b7dba0",
                    "masdevelopmentinstance2": "5c1408e0-cd47-4ba9-9b0c-c168752e2285"
                }
            }
        },
        {
            "MAS Sandbox Test1": {
                "connectInstances": {
                    "mastest1instance2": "921b9e21-6d50-4365-b861-297f61227bb8",
                    "mastest1": "cd54d26a-fee3-4645-87da-6acae50962a5"
                }
            }
        },
        {
            "MAS Sandbox Test2": {
                "connectInstances": {
                    "mastest2instance2": "d8445c54-35f2-4e65-ab0f-9c98889bdb0c",
                    "mastest2": "ce2575a1-6ad8-4694-abd6-53acf392c698"
                }
            }
        }
    ]
    return allAccountsList;
}
function getCreateWidgetRequestBody(dashboardName,metrics,instanceId,view) {
    return {
        "dashboardName": dashboardName,
        "dashboardBody": {
          "widgets": [
            {
              "type": "metric",
              "x": 0,
              "y": 0,
              "width": 12,
              "height": 6,
              "properties": {
                "view": view,
                "metrics": [
                  [ "AWS/Connect", metrics, "InstanceId", instanceId ]
                ],
                "period": 300,
                "stat": "Average",
                "region": "us-east-1",
                "title": metrics
              }
            }
          ]
        }
      };
}
window.addEventListener("load",() => {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    sessionStorage.removeItem('MetricVisionDashboardData');

    if (params.has("customerAccount")) {
        const selectedAcc = params.get("customerAccount");
        let allAccountsList = accountsAndConnectInstancesObject();
        const connectInstances = document.getElementById('connectInstances');
        connectInstances.innerHTML = `
        <button class="btn btn-secondary dropdown-toggle w-100" id="instancesId" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Instances</button>
        <div class="dropdown-menu instanceList"></div>
        `;
        let instanceList = document.querySelector(".instanceList");
        for (let i = 0; i < allAccountsList.length; i ++) {
            let accountName = Object.keys(allAccountsList[i])[0]
            if (accountName.toLowerCase() === selectedAcc.toLowerCase()) {
                for (let [connectInstanceName, connectInstanceId] of Object.entries(allAccountsList[i][accountName]["connectInstances"])) {
                    let button = document.createElement("button");
                    button.classList.add("dropdown-item");
                    button.classList.add("connectInstance")
                    button.innerHTML = connectInstanceName;
                    button.dataset.instanceId = connectInstanceId;
                    button.addEventListener("click", selectInstance)
                    instanceList.appendChild(button)
                }
            }
        }
    }
    if (params.has("access_token")) {
        const token = params.get("access_token");
        sessionStorage.setItem('MetricVisionAccessToken',token);
    }
})
function localDateToUTC(rawDateInput, rawTimeInput) {
    let [year, month, day] = rawDateInput.split("-");
    month = parseInt(month) - 1;
    let [hours, minutes] = rawTimeInput.split(":");
    let UTCDate = new Date(year, month, day, hours, minutes).toISOString()
    return UTCDate;
}
function timezoneDropdownChoice(event) {
    let timezoneDropdownButtonText = document.querySelector("#timezoneButton")
    timezoneDropdownButtonText.innerHTML = event.target.innerHTML;
}
async function getContactFlowNames() {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    let baseURL;
    if (params.has("customerAccount")) {
        const selectedAcc = params.get("customerAccount");
        const apis = getDashboardsAPI();
        baseURL = apis
        .filter(account => account[selectedAcc])
        .map(account => account[selectedAcc])[0];
    }
    // let baseURL = sessionStorage.getItem("baseApiUrl");
    let instanceId = $("#instancesId").data('instance-id');
    let paramURL = `${baseURL}/contactFlows/?instanceId=${instanceId}`;
    try {
        let token = sessionStorage.getItem("MetricVisionAccessToken");
        let response = await fetch(paramURL, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) {
            if (response.status === 401) {
                let modalEl = document.querySelector("#signInAgainModal");
                let modal = new bootstrap.Modal(modalEl);
                modal.show();
            }
            let failedResponse = await response.json();
            return {
                "errorMessage": failedResponse,
                "response": response,
                "result": false
            }
        } else {
            let contactFlowNames = await response.json();
            let contactSelect = document.getElementById("contactSelect");
            contactSelect.innerHTML = `<option value="">Select a Contact</option>`;
            let contactMetricsOptions = document.getElementById("contactMetricsOptions");
            contactMetricsOptions.style.display = 'none';
            contactFlowNames.forEach(contact => {
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
            sessionStorage.setItem("contactFlowNames", contactFlowNames)
            return {
                "contactFlowNames": contactFlowNames,
                "result": true
            }
        }
    } catch(err) {
        console.log(err)
        return {
            "errorMessage": err,
            "result": false
        }
    }
}
async function getQueueNames() {
    let baseURL;
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    if (params.has("customerAccount")) {
        const selectedAcc = params.get("customerAccount");
        const apis = getDashboardsAPI();
        baseURL = apis
        .filter(account => account[selectedAcc])
        .map(account => account[selectedAcc])[0];
    }
    // let baseURL = sessionStorage.getItem("baseApiUrl");
    let instanceId = $("#instancesId").data('instance-id');
    let paramURL = `${baseURL}/queues/?instanceId=${instanceId}`;
    try {
        let token = sessionStorage.getItem("MetricVisionAccessToken");
        let response = await fetch(paramURL, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) {
            if (response.status === 401) {
                let modalEl = document.querySelector("#signInAgainModal");
                let modal = new bootstrap.Modal(modalEl);
                modal.show();
            }
            let failedResponse = await response.json();
            return {
                "errorMessage": failedResponse,
                "response": response,
                "result": false
            }
        } else {
            let queueNames = await response.json();
            let queueSelect = document.getElementById("queueSelect");
            queueSelect.innerHTML = `<option value="">Select a Queue</option>`;
            let queueMetricsOptions = document.getElementById("queueMetricsOptions");
            queueMetricsOptions.style.display = "none";
            queueNames.forEach(queue => {
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
            sessionStorage.setItem("queueNames", queueNames)
            return {
                "queueNames": queueNames,
                "result": true
            }
        }
    } catch(err) {
        console.log(err)
        return {
            "errorMessage": err,
            "result": false
        }
    }
}
function selectInstance(event) {
    let instanceNameSpace = document.querySelector("#awsConnectInstanceName");
    let instanceId = event.target.dataset.instanceId;
    instanceNameSpace.innerHTML = event.target.innerHTML;
    $("#selected-instance").text(event.target.innerHTML);
    let finalAccountAndInstanceButton = document.querySelector("#instancesId");
    finalAccountAndInstanceButton.dataset.instanceId = instanceId
}
function handleWidgetSelection(event) {
    let finalAccountAndInstanceButton = document.querySelector("#widgetSelection");
    document.querySelector("#widgetSelection").innerHTML = event.target.dataset.value;
    finalAccountAndInstanceButton.dataset.selectedwidget = event.target.dataset.value;
    getContactFlowNames();
    getQueueNames();
}
function cleanMetricName(metricId) {
    return metricId
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/\b[a-z]/g, char => char.toUpperCase()) // Capitalize first letter of each word
        .replace(/\s+/g, " ") // Remove extra spaces
        .trim(); // Trim leading/trailing spaces
}

function createGauge(data, container) {
    // Extract values from data
    let values = data["Values"] || [];

    // Compute min, max, sum, and avg
    let min, max, avg, sum;

    if (data.Id.includes("percentage") || data.Id.includes("packet_loss")) {
        min = 0;
        max = 100;
        sum = "N/A";
    } else {
        min = values.length > 0 ? Math.min(...values) : 0;
        max = values.length > 0 ? Math.max(...values) : 1;
        sum = values.length > 0 ? values.reduce((acc, num) => acc + num, 0) : 0;
    }

    avg = values.length > 0 ? parseFloat((sum / values.length).toFixed(2)) : 0;

    // Set data for gauge
    let dataSet = anychart.data.set([avg]);

    // Create gauge chart
    let gauge = anychart.gauges.circular();
    gauge.data(dataSet);
    gauge.startAngle(270);
    gauge.sweepAngle(180);

    // Configure axis
    let axis = gauge.axis()
        .radius(95)
        .width(1);

    axis.scale()
        .minimum(min)
        .maximum(max);

    axis.ticks()
        .enabled(true)
        .type('line')
        .length('8');

    // Define gauge range
    gauge.range({
        from: min,
        to: max,
        fill: { keys: ["green", "yellow", "orange", "red"] },
        position: "inside",
        radius: 100,
        endSize: "3%",
        startSize: "3%",
        zIndex: 10
    });

    // Set needle
    gauge.needle(0)
        .enabled(true)
        .startRadius('-5%')
        .endRadius('65%')
        .middleRadius(0)
        .startWidth('0.1%')
        .endWidth('0.1%')
        .middleWidth('5%');

    // Create container elements
    let section = document.createElement("section");
    section.classList.add("flex-grow-1", "d-flex", "justify-content-around", "flex-wrap", "align-items-center");
    section.setAttribute("Id", `gauge_${data.Id}`);

    // Metric Name Column
    let metricNameDiv = document.createElement("div");
    metricNameDiv.classList.add("d-flex", "flex-column", "text-center", "mx3");
    let metricNameTextDiv = document.createElement("b");
    metricNameTextDiv.innerHTML = cleanMetricName(data.Id);
    metricNameDiv.appendChild(metricNameTextDiv);

    // Min & Max Columns
    let minMaxDiv = document.createElement("div");
    minMaxDiv.classList.add("d-flex", "flex-column", "text-center", "mx3");
    minMaxDiv.innerHTML = `<div>${min}</div><div>Minimum</div><div>${max}</div><div>Maximum</div>`;

    // Avg & Sum Columns
    let avgSumDiv = document.createElement("div");
    avgSumDiv.classList.add("d-flex", "flex-column", "text-center", "mx3");
    avgSumDiv.innerHTML = `<div>${avg}</div><div>Average</div><div>${sum}</div><div>Sum</div>`;

    // Append info to section
    section.append(metricNameDiv, minMaxDiv, avgSumDiv);

    // Create chart container
    let gaugeDiv = document.createElement("div");
    let containerId = `gauge_${data.Id}_container`;
    gaugeDiv.setAttribute("id", containerId);
    
    // Render the gauge inside the container
    gauge.container(gaugeDiv).draw();

    section.append(gaugeDiv);
    section.style.display = "none";
    container.append(section);
}
function createTable(data, container) {
    let metricLabel = cleanMetricName(data.Id)
    let tableWrapper = document.createElement("section");
    tableWrapper.setAttribute("class", "table-responsive");
    tableWrapper.setAttribute("id", `table_${data.Id}`)
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
    data.Timestamps.forEach(timestamp => {
        let header = document.createElement("th");
        header.setAttribute("scope", "col");
        header.innerHTML = timestamp;
        headerRow.appendChild(header);
    })
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
        data.Values.forEach(value => {
            let row = document.createElement("td");
            row.innerHTML = value + '%';
            columnRow.appendChild(row);
        })
    } else if (data.Id.includes("packet_loss")){
        data.Values.forEach(value => {
            let row = document.createElement("td");
            row.innerHTML = value.toFixed(3) + '%';
            columnRow.appendChild(row);
        })
    } else {
        data.Values.forEach(value => {
            let row = document.createElement("td");
            row.innerHTML = value;
            columnRow.appendChild(row);
        })
    }
    table.appendChild(tableBody);
    container.appendChild(tableWrapper);
}
function generateDataWithTimeZone() {
    let data = [];
    let time = new Date().getTime();
    time = Math.floor(time / 60000) * 60000;
    
    for (let i = 0; i < 20; i++) {
        const date = new Date(time);
        data.push([
            date.toLocaleString('en-US', { 
                timeZone: 'UTC',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
            Math.floor(Math.random() * 100)
        ]);
        time += 60000;
    }
    return data;
}
async function customTimeFetchCloudWatchData(customStartTimeandDate, customEndTimeandDate, contactFlowName, queueName, individualMetrics, period = null) {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    let baseURL;
    if (params.has("customerAccount")) {
        const selectedAcc = params.get("customerAccount");
        const apis = getDashboardsAPI();
        baseURL = apis
        .filter(account => account[selectedAcc])
        .map(account => account[selectedAcc])[0];
    }
    let customStartTimeParam = '';
    let customEndTimeParam = '';
    let contactFlowNameParam = '';
    let queueNameParam = '';
    let individualMetricsParam = '';
    if (customStartTimeandDate && customEndTimeandDate) {
        customStartTimeParam = `&customStartTimeandDate=${customStartTimeandDate}`;
        customEndTimeParam = `&customEndTimeandDate=${customEndTimeandDate}`;
    }
    if (contactFlowName) {
        contactFlowNameParam = `&contactFlowName=${contactFlowName}`
    }
    if (queueName) {
        queueNameParam = `&queueName=${queueName}`
    }
    if (individualMetrics) {
        individualMetricsParam = `&individualMetrics=${individualMetrics}`
    }
    let instanceId = $("#instancesId").data('instance-id');
    let paramURL = `${baseURL}/Any/?instanceId=${instanceId}${customStartTimeParam}${customEndTimeParam}${contactFlowNameParam}${queueNameParam}${individualMetricsParam}`;
    try {
        let token = sessionStorage.getItem("MetricVisionAccessToken");
        let response = await fetch(paramURL, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) {
            if (response.status === 401) {
                let modalEl = document.querySelector("#signInAgainModal");
                let modal = new bootstrap.Modal(modalEl);
                modal.show();
            }
            let failedResponse = await response.json();
            return {
                "errorMessage": failedResponse,
                "response": response,
                "result": false
            }
        } else {
            let cloudWatchData = await response.json();
            sessionStorage.setItem("MetricVisionDashboardData", JSON.stringify(cloudWatchData));
            return {
                "data": cloudWatchData,
                "result": true
            }
        }
    } catch (err) {
        console.log(err)
        return {
            "errorMessage": err,
            "result": false
        }
    }
}
function chooseMetrics(event) {
    let individualMetricsList = [];
    let contactName = '';
    let queueName = '';
    let instanceMetricsCheckboxes = document.querySelectorAll(".instance-metrics");
    let contactMetricsCheckboxes = document.querySelectorAll(".contact-metrics");
    let contactNameDropdown = document.querySelector("#contactSelect");
    let queueNameDropdown = document.querySelector("#queueSelect");
    let queueMetricsCheckboxes = document.querySelectorAll(".queue-metrics");
    instanceMetricsCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            individualMetricsList.push(checkbox.id)
        }
    });
    contactMetricsCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            individualMetricsList.push(checkbox.id);
            contactName = contactNameDropdown.value
        }
    });
    queueMetricsCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            individualMetricsList.push(checkbox.id);
            queueName = queueNameDropdown.value;
        }
    })
    let individualMetricsString = individualMetricsList.toString();
    return {
        "individualMetricsString": individualMetricsString,
        "contactName": contactName,
        "queueName": queueName
    }
}
function createLineGraphNew(data, container) {
    let metric = data.Id;
    let chartMetricData = [];
    for (let i = 0; i < data["Timestamps"].length; i++) {
        let chartData = [];
        if (metric === "to_instance_packet_loss_rate") {
            chartData.push(data["Timestamps"][i], data["Values"][i].toFixed(3))
            chartMetricData.push(chartData)
            continue
        } else {
            chartData.push(data["Timestamps"][i], data["Values"][i])
            chartMetricData.push(chartData)
        }
    }
    let graphData = {
        "title": metric,
        "xAxis": "Interval",
        "yAxis": metric,
        "data": chartMetricData
    }
    chartLineGraph(graphData, container)
}
function chartLineGraph(graphData, container) {
    let {title, xAxis, yAxis, data} = graphData;
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
function createTableLineGauge(data,container) {
    if (data.Id.includes("percentage")) {
        data.Values.forEach(function(value, index) {
            data.Values[index] = Math.floor(value * 100)
        })
    }
    createLineGraphNew(data, container);
}
async function getWidgets(){
    let instanceId = $("#instances").val();
    let startDate = document.querySelector("#customStartDate").value
    let endDate = document.querySelector("#customEndDate").value
    let startTime = document.querySelector("#startTime").value
    let endTime = document.querySelector("#endTime").value
    let timezoneChoice = document.querySelector("#timezoneButton").innerHTML
    let chosenMetrics = chooseMetrics();
    let metricsInput = document.querySelector("#metricsInput");
    if (startDate && endDate && startTime && endTime && chosenMetrics.individualMetricsString) {
        metricsInput.innerHTML = '';
    } else {
        metricsInput.setAttribute("style", "color: red;")
        metricsInput.innerHTML = "Please select a start time and date, an end time and date, and at least 1 metric from the dropdown"
        return
    }
    let localTimezoneChoice = timezoneChoice.split(" ")[0];
    let formatterOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }
    let timezoneFormats = {
        "Hawaii": "Pacific/Honolulu",
        "Alaska": "America/Anchorage",
        "Pacific": "America/Los_Angeles", 
        "Mountain": "America/Denver",
        "Central": "America/Chicago",
        "Eastern": "America/New_York",
        "UTC": "UTC"
    }
    if (localTimezoneChoice != "Local") {
        formatterOptions.timeZone = timezoneFormats[localTimezoneChoice];
    }
    let startUTC = localDateToUTC(startDate, startTime);
    let endUTC = localDateToUTC(endDate, endTime);
    $("#loader").show();
    try{
        
        let data = await customTimeFetchCloudWatchData(startUTC, endUTC, chosenMetrics['contactName'],chosenMetrics['queueName'],chosenMetrics['individualMetricsString'])
        if (!data.result) {
            $("#loader").hide();
            let sectionHeader = document.querySelector("#metricsInput");
            $("#metricsInput").empty();
            let error = document.createElement("p");
            error.innerHTML = `Error: ${data.errorMessage.status}`;
            sectionHeader.appendChild(error);
        } else {
            $("#loader").hide();
            let metricDataResults = data.data.MetricDataResults.length;
            for (let i = 0; i < metricDataResults; i++) {
                if (data.data.MetricDataResults[i]['Timestamps'].length > 0) {
                    let timestampsArray = data.data.MetricDataResults[i]['Timestamps']
                    for (let j = 0; j < timestampsArray.length; j++) {
                        let formatter = new Intl.DateTimeFormat("en-US", formatterOptions)
                        let UTCDate = timestampsArray[j] + " UTC";
                        let UTCDateObject = new Date(UTCDate);
                        let formattedDate = formatter.format(UTCDateObject);
                        timestampsArray[j] = formattedDate;
                    }
                }
            }
            $(".chartContainer").show();
            let chartContainer = document.querySelector(".chartContainer");
            $(".chartContainer").empty();
            let div = document.createElement("div");
            div.classList.add("dashboard-container");
            let dasboardContentWrapper = document.createElement("div");
            dasboardContentWrapper.classList.add("dashboard-wrapper");
            let p = document.createElement("p");
            div.append(p);
            for (let i = 0; i < metricDataResults; i++) {
                let innerDiv = document.createElement("div");
                let id = 'id_' + Math.random().toString(36).substr(2, 9);
                innerDiv.id = id;
                innerDiv.classList.add("chart");
                dasboardContentWrapper.append(innerDiv);
                div.append(dasboardContentWrapper);
                if (data.data.MetricDataResults[i].Id.includes("percentage")) {
                    data.data.MetricDataResults[i].Values.forEach(function(value, index) {
                        data.data.MetricDataResults[i].Values[index] = Math.floor(value * 100)
                    })
                }
                if(document.querySelector("#widgetSelection").dataset.selectedwidget.toLowerCase() == 'line') {
                    createTableLineGauge(data.data.MetricDataResults[i], innerDiv);
                }
                if(document.querySelector("#widgetSelection").dataset.selectedwidget.toLowerCase() == 'numberchart') {
                    createTable(data.data.MetricDataResults[i], innerDiv);
                }
                if(document.querySelector("#widgetSelection").dataset.selectedwidget.toLowerCase() == 'gauge') {
                    createGauge(data.data.MetricDataResults[i], innerDiv);
                }
            }
            chartContainer.append(div);
        }
    } catch(err){
        console.log(err);
    }

}
async function saveDashboards() {
    const accName = $("#accountName").val();
    const dashboardData = sessionStorage.getItem('MetricVisionDashboardData');
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    if (accName.trim() === '' || accName.length === 0) {
        window.alert("Enter Dashboard Name");
        return;
    }
    if(!dashboardData) {
        window.alert("There is no valid dashboard to save!!");
        return;
    } 
    let dashboardPayloadData = new Object();
    let payloadData = new Object();
    dashboardPayloadData = {
        'data' : JSON.parse(dashboardData),
        'name' : accName,
        'widgetType': document.querySelector("#widgetSelection").dataset.selectedwidget.toLowerCase(),
    }
    payloadData = {
        'accountName': params.get("customerAccount"),
        "dashboard_data": [
            dashboardPayloadData
        ]
    }
    console.log("payloadData",payloadData);
    let paramURL = "https://l2y83qdrp0.execute-api.us-east-1.amazonaws.com/test/saveDashboard";
    try {
        $("#loader").show();
        const response = await fetch(paramURL, {
            method: "POST",
            body: JSON.stringify(payloadData),
        });
        if (!response.ok) {
            $("#loader").hide();
            window.alert("error occured!!");
        } else {
            $("#loader").hide();
           window.alert("successfully saved!!");
        }
    } catch(err) {
        console.log(err)
        return {
            "errorMessage": err,
            "result": false
        }
    }
}