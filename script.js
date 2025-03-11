let walletAddress = ""; // Wallet address will be fetched dynamically

// Function to refresh balance, now accepts walletAddress as a parameter
function refreshBalance(walletAddress) {
    let balanceElement = document.getElementById('user-balance');
    balanceElement.innerText = "Loading..."; // Show loading text while fetching data

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
            console.log("Response Status:", response.status); // Log response status
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("API Response Data:", data); // Log API response data for debugging

            if (data && data.account) {
                let balance = data.account.amount / 1e6; // Convert from microAlgos to ALGO
                console.log("Fetched Balance:", balance); // Log the fetched balance
                balanceElement.innerText = `Balance: ${balance.toFixed(4)} ALGO`; // Update balance with 4 decimal precision
            } else {
                console.error("No 'account' data in API response.");
                balanceElement.innerText = "NO WALLET LINKED"; // Error handling
            }
        })
        .catch(error => {
            console.error("0 ALGO:", error);
            balanceElement.innerText = "0 ALGO"; // Show error message if something goes wrong
        });
}

// Function to get the wallet address dynamically
function getWalletAddress() {
    return document.getElementById("wallet-address").innerText.trim();
}

// Attach event listener to refresh button
document.addEventListener("DOMContentLoaded", function () {
    console.log("Page loaded, waiting for wallet address...");

    // Fetch wallet address from Firestore once user ID is available
    let userIdElement = document.getElementById("user-id");
    let userId = userIdElement ? userIdElement.innerText.trim() : null;

    if (userId && !isNaN(userId)) {
        console.log("Fetching wallet address for user ID:", userId);

        db.collection("user_addresses").where("user_id", "==", Number(userId))
            .get()
            .then(querySnapshot => {
                if (querySnapshot.empty) {
                    document.getElementById("wallet-address").innerText = "No address found.";
                } else {
                    querySnapshot.forEach(doc => {
                        walletAddress = doc.data().address;
                        console.log("User Address from Firestore:", walletAddress);
                        document.getElementById("wallet-address").innerText = walletAddress || "No address found.";

                        // Refresh balance after wallet address is set
                        refreshBalance(walletAddress);
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
});

// Attach event listener to the refresh button
document.querySelector('.withdraw-button').addEventListener("click", function () {
    let walletAddress = getWalletAddress(); // Get wallet address from the page
    console.log("Refresh button clicked. Wallet Address:", walletAddress);
    refreshBalance(walletAddress); // Refresh balance on click
});

// Handle Heads & Tails Button Selection with Haptic Feedback
document.querySelectorAll(".coin-button").forEach(button => {
    button.addEventListener("click", function () {
        // Remove active state from all buttons
        document.querySelectorAll(".coin-button").forEach(btn => {
            btn.classList.remove("active");
        });

        // Add active state to clicked button
        this.classList.add("active");

        // Apply LIGHT haptic feedback for heads/tails
        Telegram.WebApp.HapticFeedback.impactOccurred('light');
    });
});

// Handle Withdraw Button with SOFT Haptic Feedback
document.querySelector(".withdraw-button").addEventListener("click", function () {
    Telegram.WebApp.HapticFeedback.impactOccurred('soft');
});

// Handle Spin Button with HEAVY Haptic Feedback
document.querySelector(".spin-button").addEventListener("click", function () {
    Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
    showPopup();  // Show the popup
});

document.querySelector(".spin-button").addEventListener("click", function () {
    // Check if the bet amount is filled and if either Heads or Tails is selected
    let betAmount = document.getElementById("bet-amount").value;
    let selectedOption = document.querySelector(".coin-button.active");

    // If either bet amount is empty or no selection is made for heads/tails, show the popup
    if (!betAmount || !selectedOption) {
        showPopup();  // Show the popup
    } else {
        // If everything is filled, proceed without showing the popup
        Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
        // Add logic for spinning the coin here, if any
    }
});

// Function to show the popup
function showPopup() {
    Telegram.WebApp.showPopup({
        title: 'Please Review 🚫',
        message: 'Please fill in the bet amount and select either Heads or Tails before proceeding.',
        buttons: [
            {type: 'cancel'},
        ]
    }, function (buttonId) {
        if (buttonId === 'delete') {
            alert("'Delete all' selected");
        } else if (buttonId === 'faq') {
            Telegram.WebApp.openLink('https://telegram.org/faq');
        }
    });
}

// Function to get the user's wallet address dynamically
function getWalletAddress() {
    return document.getElementById("wallet-address").innerText.trim();
}
