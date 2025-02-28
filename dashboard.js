window.addEventListener("load", () => {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    if (params.has("access_token")) {
        const token = params.get("access_token");
        sessionStorage.setItem('MetricVisionAccessToken', token);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    checkTheme();
});

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

function customerAccountChange(event) {
    $("#saveDashboards").attr("disabled", false);
    $("#createDashboards").attr("disabled", false);
}

function createDashboards() {
    let accessToken = sessionStorage.getItem("MetricVisionAccessToken");

    if (accessToken) {
        const selectedAcc = document.querySelector("#customerAccounts").innerHTML;
        const navURL = `/createDashboard.html?customerAccount=${selectedAcc}&access_token=${accessToken}`;
        window.open(navURL, '_blank');
    } else {
        alert("Access token not found. Please sign in again.");
    }
}

function handleInputChange(event) {
    console.log(event.target.value);
    $("#createDashboards").attr("disabled", false);
}

function getSavedDashboardsAPI() {
    const savedDashboardsAPI = {
        "MAS Sandbox Development": "https://szw9nl20j5.execute-api.us-east-1.amazonaws.com/test/getdashboards",
        "MAS Sandbox Test1": "https://8vauowiu26.execute-api.us-east-1.amazonaws.com/test/getdashboards",
        "MAS Sandbox Test2": "https://9v5jzdmc6a.execute-api.us-east-1.amazonaws.com/test/getdashboards",
        "CDW Cloud MS": "https://2zjrlu9al4.execute-api.us-east-1.amazonaws.com/test/showsaveDashboard"
    };
    return savedDashboardsAPI;
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
    let values = data["Values"] || [];
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

    let dataSet = anychart.data.set([avg]);
    let gauge = anychart.gauges.circular();
    gauge.data(dataSet);
    gauge.startAngle(270);
    gauge.sweepAngle(180);

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

    gauge.needle(0)
        .enabled(true)
        .startRadius('-5%')
        .endRadius('65%')
        .middleRadius(0)
        .startWidth('0.1%')
        .endWidth('0.1%')
        .middleWidth('5%');

    let section = document.createElement("section");
    section.classList.add("flex-grow-1", "d-flex", "justify-content-around", "flex-wrap", "align-items-center");
    section.setAttribute("Id", `gauge_${data.Id}`);

    let metricNameDiv = document.createElement("div");
    metricNameDiv.classList.add("d-flex", "flex-column", "text-center", "mx3");
    let metricNameTextDiv = document.createElement("b");
    metricNameTextDiv.innerHTML = cleanMetricName(data.Id);
    metricNameDiv.appendChild(metricNameTextDiv);

    let minMaxDiv = document.createElement("div");
    minMaxDiv.classList.add("d-flex", "flex-column", "text-center", "mx3");
    minMaxDiv.innerHTML = `<div>${min}</div><div>Minimum</div><div>${max}</div><div>Maximum</div>`;

    let avgSumDiv = document.createElement("div");
    avgSumDiv.classList.add("d-flex", "flex-column", "text-center", "mx3");
    avgSumDiv.innerHTML = `<div>${avg}</div><div>Average</div><div>${sum}</div><div>Sum</div>`;

    section.append(metricNameDiv, minMaxDiv, avgSumDiv);

    let gaugeDiv = document.createElement("div");
    let containerId = `gauge_${data.Id}_container`;
    gaugeDiv.setAttribute("id", containerId);

    gauge.container(gaugeDiv).draw();

    section.append(gaugeDiv);
    section.style.display = "none";
    container.append(section);
}

async function deleteAllDashboardHandler() {
    let payloadData = {
        'accountName': document.querySelector("#customerAccounts").innerHTML,
        'dashboard_name': ''
    };
    let accountName = document.querySelector("#customerAccounts").innerHTML;
    let apiURL = getSavedDashboardsAPI()[accountName];

    if (window.confirm("Are you sure, want to delete all the saved dashboards?")) {
        $("#loader").show();
        try {
            let response = await fetch(apiURL, {
                method: 'DELETE',
                body: JSON.stringify(payloadData)
            });
            if (!response.ok) {
                $("#loader").hide();
                window.alert("Dashboard Deletion Not Successful");
                console.error("Deletion Not Successful");
            } else {
                $("#loader").hide();
                window.alert("Dashboard Deleted Successfully");
                getSavedDashboards();
            }
        } catch (err) {
            $("#loader").hide();
        }
    } else {
        console.log("Cancelled!");
    }
}

async function getSavedDashboards() {
    let customerAccount = document.querySelector("#customerAccounts").innerHTML;
    let apiURL = getSavedDashboardsAPI()[customerAccount];

    $("#loader").show();
    let payloadData = {
        "accountName": customerAccount
    };

    try {
        await fetch(apiURL, {
            method: 'POST',
            body: JSON.stringify(payloadData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const body = JSON.parse(data.body);
                let parsedData = JSON.parse(body["data"]);
                $(".chartContainer").show();
                let chartContainer = document.querySelector(".chartContainer");
                $(".chartContainer").empty();
                $(".dashboard-container").empty();

                if (Object.entries(parsedData).length !== 0) {
                    let parentdiv = document.createElement("div");
                    parentdiv.classList.add("dashboard-parent-container");
                    let dashboardHeader = document.createElement("p");
                    dashboardHeader.innerHTML = "Dashboards";
                    let deleteAllText = document.createElement("button");
                    deleteAllText.classList.add("btn-block");
                    deleteAllText.classList.add("btn");
                    deleteAllText.classList.add("btn-secondary");
                    deleteAllText.innerHTML = "Delete All";
                    deleteAllText.addEventListener("click", deleteAllDashboardHandler);
                    parentdiv.append(dashboardHeader);
                    parentdiv.append(deleteAllText);
                    chartContainer.append(parentdiv);

                    for (const [keys, data] of Object.entries(parsedData)) {
                        let div = document.createElement("div");
                        div.classList.add("dashboard-container");
                        let dasboardContentWrapper = document.createElement("div");
                        dasboardContentWrapper.classList.add("dashboard-wrapper");
                        let p = document.createElement("p");
                        p.innerHTML = `${data[0]["name"]} Dashboard`;
                        div.append(p);

                        for (const [keys, mData] of Object.entries(data[0]["data"]["MetricDataResults"])) {
                            let innerDiv = document.createElement("div");
                            let id = 'id_' + Math.random().toString(36).substr(2, 9);
                            innerDiv.id = id;
                            innerDiv.classList.add("chart");
                            dasboardContentWrapper.append(innerDiv);
                            div.append(dasboardContentWrapper);

                            if (mData.Id.includes("percentage")) {
                                mData.Values.forEach(function (value, index) {
                                    mData.Values[index] = Math.floor(value * 100)
                                });
                            }

                            if (data[0]["widgetType"].toLowerCase() == 'line') {
                                createTableLineGauge(mData, innerDiv);
                            }
                            if (data[0]["widgetType"].toLowerCase() == 'numberchart') {
                                createTable(mData, innerDiv);
                            }
                            if (data[0]["widgetType"].toLowerCase() == 'gauge') {
                                createGauge(mData, innerDiv);
                            }
                        }

                        div.append(dasboardContentWrapper);
                        chartContainer.append(div);
                    }
                } else {
                    let noDataFoundContainer = document.createElement("p");
                    noDataFoundContainer.innerHTML = "No Saved Dashboards";
                    noDataFoundContainer.style = "text-align:center";
                    chartContainer.append(noDataFoundContainer);
                }

                $("#loader").hide();
            })
            .catch(error => {
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
    } catch (err) {
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

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}

function selectAccount(event) {
    let title = event.target.innerHTML;
    document.querySelector("#customerAccounts").innerHTML = title;
    // Enable buttons
    $("#saveDashboards").attr("disabled", false);
    $("#createDashboards").attr("disabled", false);
    getSavedDashboards();  // Call this function to fetch dashboards based on the selected account
}
