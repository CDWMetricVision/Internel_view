async function getSavedDashboards() {
    let customerAccount = document.querySelector("#customerAccounts").innerHTML;
    let apiURL = getSavedDashboardsAPI()[customerAccount]; // Use the selected account to get the correct API URL

    $("#loader").show();  // Show loading spinner
    let payloadData = {
        "accountName": customerAccount
    }

    try {
        await fetch(apiURL, {
            method: 'POST',
            body: JSON.stringify(payloadData)
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            const body = JSON.parse(data.body);
            let parsedData = JSON.parse(body["data"]);

            $(".chartContainer").show();  // Display the chart container
            let chartContainer = document.querySelector(".chartContainer");
            $(".chartContainer").empty();  // Clear the existing content
            $(".dashboard-container").empty();  // Clear the existing dashboard container

            if (Object.entries(parsedData).length !== 0) {
                let parentdiv = document.createElement("div");
                parentdiv.classList.add("dashboard-parent-container");
                
                let dashboardHeader = document.createElement("p");
                dashboardHeader.innerHTML = "Dashboards";

                let deleteAllText = document.createElement("button");
                deleteAllText.classList.add("btn-block", "btn", "btn-secondary");
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

                        // Process the widget types and create corresponding UI elements
                        if (mData.Id.includes("percentage")) {
                            mData.Values.forEach(function(value, index) {
                                mData.Values[index] = Math.floor(value * 100);
                            });
                        }

                        if (data[0]["widgetType"].toLowerCase() === 'line') {
                            createTableLineGauge(mData, innerDiv);
                        }
                        if (data[0]["widgetType"].toLowerCase() === 'numberchart') {
                            createTable(mData, innerDiv);
                        }
                        if (data[0]["widgetType"].toLowerCase() === 'gauge') {
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
            $("#loader").hide();  // Hide loading spinner
        }).catch(error => {
            $("#loader").hide();  // Hide loading spinner
            $(".chartContainer").show();
            let chartContainer = document.querySelector(".chartContainer");
            $(".chartContainer").empty();
            let p = document.createElement("p");
            p.innerHTML = 'Error Occured';
            p.classList.add('error');
            p.classList.add('text-center');
            chartContainer.append(p);
            console.error('There was a problem with the fetch operation:', error);
        });
    } catch (err) {
        $(".chartContainer").show();
        let chartContainer = document.querySelector(".chartContainer");
        $(".chartContainer").empty();
        let p = document.createElement("p");
        p.innerHTML = 'Error Occured';
        p.classList.add('error');
        p.classList.add('text-center');
        chartContainer.append(p);
        console.log(err);
    }
}
