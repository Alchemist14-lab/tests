let walletAddress = "";  // Initialize with an empty value, as this will be dynamically assigned

// Function to refresh balance
function refreshBalance() {
    let balanceElement = document.getElementById('user-balance');
    balanceElement.innerText = "Loading...";  // Show loading text while fetching data

    if (!walletAddress) {
        balanceElement.innerText = "No wallet address found.";
        return;  // If wallet address is not available, do not proceed
    }

    // Fetch wallet balance using Delfly API
    let url = `https://mainnet-idx.algonode.cloud/v2/accounts/${walletAddress}`;

    console.log("Sending request to fetch balance...");

    // Use fetch to get the response from the API
    fetch(url)
        .then(response => {
            console.log("Response Status:", response.status);  // Log response status
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("API Response Data:", data);  // Log API response data for debugging

            if (data && data.account) {
                let balance = data.account.amount / 1e6;  // Convert from microAlgos to ALGO
                console.log("Fetched Balance:", balance);  // Log the fetched balance
                balanceElement.innerText = `Balance: ${balance.toFixed(4)} ALGO`;  // Update balance with 4 decimal precision
            } else {
                console.error("No 'account' data in API response.");
                balanceElement.innerText = "Error fetching balance";  // Error handling
            }
        })
        .catch(error => {
            console.error("Error fetching balance:", error);
            balanceElement.innerText = "Error fetching balance";  // Show error message if something goes wrong
        });
}

// Fetch wallet address based on user ID directly from the user-id displayed on the page
const userIdFromPage = document.getElementById("user-id").innerText;

// Query the database using userId from page (ensure it's a valid number)
if (userIdFromPage && !isNaN(userIdFromPage)) {
    db.collection("user_addresses").where("user_id", "==", Number(userIdFromPage))  // Ensure it's the right type
        .get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                document.getElementById("wallet-address").innerText = "No address found.";
            } else {
                querySnapshot.forEach(doc => {
                    const userAddress = doc.data().address;
                    document.getElementById("wallet-address").innerText = userAddress || "No address found.";
                    walletAddress = userAddress;  // Set the walletAddress dynamically
                    refreshBalance();  // Call refreshBalance after setting the walletAddress
                });
            }
        })
        .catch(error => {
            console.error("Error fetching wallet address:", error);
            document.getElementById("wallet-address").innerText = "Error fetching address.";
        });
} else {
    document.getElementById("wallet-address").innerText = "Invalid User ID.";
}

// Call refreshBalance() on page load to display the initial balance
document.addEventListener("DOMContentLoaded", function() {
    console.log("Page loaded, refreshing balance...");
    refreshBalance();  // Ensure refreshBalance is called even if walletAddress is fetched later
});

// Call refreshBalance when the refresh button is clicked
document.querySelector('.withdraw-button').addEventListener("click", function() {
    console.log("Refresh button clicked, refreshing balance...");
    refreshBalance();
});
