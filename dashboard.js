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

function customerAccountChange(event) {
    $("#saveDashboards").attr("disabled", false);
    $("#createDashboards").attr("disabled", false);
}

function createDashboards() {
    const selectedAcc = $("#customerAccounts").val();
    const navURL = '/createDashboard.html?' + 'customerAccount='+selectedAcc;
    window.open(navURL, '_blank');
}

function handleInputChange(event) {
    console.log(event.target.value);
    $("#createDashboards").attr("disabled", false);
}

function saveDashboards() {
    const accName = $("#accountName").val();
    
    if (accName.trim() === '' || accName.length === 0) {
        window.alert("Enter Dashboard Name");
    }
}

function getSavedDashboardsAPI() {
    const savedDashboardsAPI = [
        {
            "MAS Sandbox Development":"https://szw9nl20j5.execute-api.us-east-1.amazonaws.com/test/getdashboards",
        },
        {
            "MAS Sandbox Test1":"https://8vauowiu26.execute-api.us-east-1.amazonaws.com/test/getdashboards",
        },
        {
            "MAS Sandbox Test2":"https://9v5jzdmc6a.execute-api.us-east-1.amazonaws.com/test/getdashboards",
        }
    ]
    return savedDashboardsAPI;
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
    data = [];
    return data;
}
function renderChart(container, metricName, seriesData) {
        let chart = anychart.line();
        let series = chart.line(seriesData);
        series.name(metricName);
        chart.title(metricName + " Over Time");
        let flexDiv = document.createElement("section");
        flexDiv.classList.add("flex-grow-1");
        let flexDivId = `lineChart_${metricName}`;
        flexDiv.setAttribute("id", flexDivId);
        chart.container(flexDiv);
        chart.draw();
        container.appendChild(flexDiv);
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

    if (data.Id && (data.Id.includes("percentage") || data.Id.includes("packet_loss"))) {
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
    tableWrapper.setAttribute("style", "display: none !important");
    container.appendChild(tableWrapper);
}
async function getSavedDashboards() {
    let customerAccount = $("#customerAccounts").val()
    const apis = getSavedDashboardsAPI();
    let apiURL = apis
    .filter(account => account[customerAccount])
    .map(account => account[customerAccount])[0];
    $("#loader").show();
    try{
        await fetch(apiURL,
            {
                method: "GET",
            }
        ).then(response =>{
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
            }).then(data=>{
                const body = data.body;
                console.log(body.data);
                $(".chartContainer").show();
                let chartContainer = document.querySelector(".chartContainer");
                $(".chartContainer").empty();
                // chartContainer.empty();
                $(".dashboard-container").empty();

                for (const key in body.data) {
                    let div = document.createElement("div");
                    div.classList.add("dashboard-container");
                    let dasboardContentWrapper = document.createElement("div");
                    dasboardContentWrapper.classList.add("dashboard-wrapper");
                    let p = document.createElement("p");
                    p.innerHTML = `${key} Dashboard`;
                    div.append(p);

                    console.log(`Key: ${key}`);
                    
                    const parsedData = JSON.parse(body.data[key]);
                    const metrics = parsedData.widgets.map(widget => ({
                        name: widget.properties.metrics[0][1], // Metric name
                        instanceId: widget.properties.metrics[0][3], // Instance ID
                        region: widget.properties.region
                    }));
                    // const timeSeriesData = generateDataWithTimeZone();
                    timeSeriesData = []; // need to change accordingly for the data recieved

                    if (parsedData.widgets && parsedData.widgets.length > 0) {
                        for (const widget of parsedData.widgets) {
                            let id = 'id_' + Math.random().toString(36).substr(2, 9);
                            let innerDiv = document.createElement("div");
                            innerDiv.id = id;
                            innerDiv.classList.add("chart");
                            dasboardContentWrapper.append(innerDiv);
                            if(widget.properties.view && widget.properties.view == "gauge") {
                                createGauge({ Id: metrics[0].name, Values: timeSeriesData.map(d => d[1]) }, innerDiv);
                            }
                            else if(widget.properties.view && widget.properties.view == "bar"){
                                renderChart(innerDiv, widget["properties"]["title"], timeSeriesData);
                            }
                            else if(widget.properties.view && widget.properties.view == "table"){
                                // need to change
                                // createTable({ Id: metrics[0].name, Values: timeSeriesData, Timestamps: timeSeriesData }, innerDiv);
                                renderChart(innerDiv, widget["properties"]["title"], timeSeriesData); 
                            }
                            else {
                                renderChart(innerDiv, widget["properties"]["title"], timeSeriesData);
                            }
                            console.log(`  Type: ${widget.type}`);
                            console.log(`  Position: (${widget.x}, ${widget.y})`);
                            console.log(`  Size: ${widget.width}x${widget.height}`);
                            console.log(`  Properties:`, widget.properties);
                        }
                        div.append(dasboardContentWrapper);
                    } else {
                        console.log("  No widgets found.");
                    }
                    chartContainer.append(div);
                }
                // createTable(body);
                $("#loader").hide();

            })
            .catch(error =>{
                $("#loader").hide();
                $(".chartContainer").show();
                let chartContainer = document.querySelector(".chartContainer");
                $(".chartContainer").empty();
                let p = document.createElement("p");
                p.innerHTML = 'Error Occured';
                p.classList.add = 'error'
                chartContainer.append(p);
                console.error('There was a problem with the fetch operation:', error);
            });
    } catch(err){
        $(".chartContainer").show();
        let chartContainer = document.querySelector(".chartContainer");
        $(".chartContainer").empty();
        let p = document.createElement("p");
        p.innerHTML = 'Error Occured';
        p.classList.add = 'error'
        p.classList.add = 'text-center';
         chartContainer.append(p);
        console.log(err);
    }

}

function selectAllConnectMetrics(event) {
    let instanceMetricsCheckboxes = document.querySelectorAll(".instance-metrics");
    instanceMetricsCheckboxes.forEach(checkbox => {
        checkbox.checked = event.target.checked;
    })
}