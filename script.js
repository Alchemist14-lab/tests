let walletAddress = "DZUWOAYBG65C6G2TT7CVSKMQ2OU5SAWPBOI4TXXWQ746JXWQ6RHSX5BNMA";  // Example wallet address

// Function to refresh balance, now accepts walletAddress as a parameter
function refreshBalance(walletAddress) {
    let balanceElement = document.getElementById('user-balance');
    balanceElement.innerText = "Loading...";  // Show loading text while fetching data

    if (!walletAddress) {
        console.error("No wallet address provided.");
        balanceElement.innerText = "Error: No wallet address.";
        return;
    }

    // Fetch wallet balance using Delfly API
    let url = `https://mainnet-idx.algonode.cloud/v2/accounts/${walletAddress}`;

    console.log("Sending request to fetch balance for address:", walletAddress);

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

// Call refreshBalance() on page load to display the initial balance, with an empty walletAddress
document.addEventListener("DOMContentLoaded", function() {
    console.log("Page loaded, waiting for wallet address...");
});
