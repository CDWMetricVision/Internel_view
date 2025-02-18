let alarmsData = []; // Global variable to store alarms data

// Function to get available accounts and their respective API URLs
function getAccountsAlarmsAPI() {
    const allAccountsAlarmsList = [
        {
            "MAS Sandbox Development": {
                "cloudWatchAPI": "https://szw9nl20j5.execute-api.us-east-1.amazonaws.com/test/getalarm"
            }
        },
        {
            "MAS Sandbox Test1": {
                "cloudWatchAPI": "https://8vauowiu26.execute-api.us-east-1.amazonaws.com/test/getalarm"
            }
        },
        {
            "MAS Sandbox Test2": {
                "cloudWatchAPI": "https://9v5jzdmc6a.execute-api.us-east-1.amazonaws.com/test/getalarm"
            }
        }
    ];
    return allAccountsAlarmsList;
}

// Updated customerAccountChange to automatically trigger fetch when account is selected
function customerAccountChange(event) {
    const selectedAccount = event.target.value;
    if (selectedAccount) {
        getAlarmsData(selectedAccount);
    }
}

// Function to filter the table based on selected state
function filterByState(event) {
    const selectedState = event.target.value.trim().toLowerCase(); // Get and trim the selected state value
    
    // If no state is selected, show all alarms
    if (!selectedState) {
        displayTable(alarmsData); // Display all data if no filter is selected
    } else {
        // Filter alarms based on the selected state
        const filteredAlarms = alarmsData.filter(alarm => 
            alarm.State && alarm.State.toLowerCase() === selectedState // Match based on the 'State' field
        );

        if (filteredAlarms.length > 0) {
            displayTable(filteredAlarms); // Display the filtered table
        } else {
            // If no alarms match the selected state, show a message
            displayTable([]);
        }
    }
}

// Function to create a table from the alarms data
function createTable(alarms) {
    alarmsData = alarms; // Store alarms globally

    // Display the table based on filtered data
    displayTable(alarms);
}

// Function to display the table
function displayTable(alarms) {
    const table = $('#alarmsList table');
    
    // Clear existing table content
    table.empty();
    
    // If no alarms are available
    if (alarms.length === 0) {
        table.append('<tbody><tr><td colspan="5">No alarms found for the selected state.</td></tr></tbody>');
        return;
    }

    // Create table header
    const headers = Object.keys(alarms[0]);
    let headerHtml = '<thead><tr>';
    
    headers.forEach(headerText => {
        headerHtml += `<th>${headerText}</th>`;
    });
    
    headerHtml += '</tr></thead>';
    table.append(headerHtml);
    
    // Create table body
    let bodyHtml = '<tbody>';
    
    alarms.forEach(alarm => {
        bodyHtml += '<tr>';
        headers.forEach(header => {
            if (header.toLowerCase() === 'state' && alarm[header].toLowerCase() === 'alarm') {
                bodyHtml += `<td class="red">${alarm[header]}</td>`;
            } else {
                bodyHtml += `<td>${alarm[header]}</td>`;
            }
        });
        bodyHtml += '</tr>';
    });
    
    bodyHtml += '</tbody>';
    table.append(bodyHtml);
}

// Function to get alarms data from CloudWatch API for the selected account
async function getAlarmsData(selectedAccount) {
    const accounts = getAccountsAlarmsAPI();

    let apiURL = accounts
        .filter(account => account[selectedAccount])
        .map(account => account[selectedAccount].cloudWatchAPI)[0];

    // Get the access token from sessionStorage
    const token = sessionStorage.getItem("MetricVisionAccessToken");

    if (!token) {
        console.error("Access token is missing!");
        return;
    }

    try {
        // Make the fetch request with the access token in headers
        await fetch(apiURL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,  // Add the token to the Authorization header
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const body = JSON.parse(data.body); // Parse the body string into an array of objects
            console.log(body);
            createTable(body);  // Display the data in a table
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    } catch (err) {
        console.log(err);
    }
}

function showMetrics() {
  window.location.href = "./metrics.html";
}

function showDashboards() {
  window.location.href = "./dashboard.html";
}

function toggleDarkMode() {
  document.getElementsByTagName("body")[0].classList.toggle("dark-mode");
}
