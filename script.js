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

    if (!walletAddress || walletAddress === "Fetching wallet address..." || walletAddress === "No address found.") {
        console.error("Invalid wallet address. Cannot refresh balance.");
        document.getElementById('user-balance').innerText = "no wallet address linked.";
        return;
    }

    refreshBalance(walletAddress);
});

document.addEventListener("DOMContentLoaded", function () {
    const betAmountInput = document.getElementById("bet-amount");

    // Check for input changes and toggle the glow effect
    betAmountInput.addEventListener("input", function () {
        // Remove non-numeric characters
        betAmountInput.value = betAmountInput.value.replace(/[^0-9]/g, '');

        // Stop glowing when there is a value
        if (betAmountInput.value.trim() !== "") {
            betAmountInput.classList.add("no-glow"); // Stop glowing
        } else {
            betAmountInput.classList.remove("no-glow"); // Start glowing again
        }
    });

    // Close keyboard when tapping outside the input box (mobile devices)
    document.addEventListener("click", function(event) {
        if (!betAmountInput.contains(event.target)) {
            betAmountInput.blur(); // Close the keyboard
        }
    });
});

// Function to show the popup
function showPopup() {
    Telegram.WebApp.showPopup({
        title  : 'Popup title',
        message: 'Please enter a bet amount before spinning.',
        buttons: [
            {id: 'delete', type: 'destructive', text: 'Delete all'},
            {id: 'faq', type: 'default', text: 'Open FAQ'},
            {type: 'cancel'},
        ]
    }, function (buttonId) {
        if (buttonId === 'delete') {
            DemoApp.showAlert("'Delete all' selected");
        } else if (buttonId === 'faq') {
            Telegram.WebApp.openLink('https://telegram.org/faq');
        }
    });
}

// Handle Spin Button with HEAVY Haptic Feedback and Bet Amount Check
document.querySelector(".spin-button").addEventListener("click", function() {
    // Check if the bet amount is empty
    let betAmount = document.getElementById("bet-amount").value;
    
    // If bet amount is empty, show the popup
    if (!betAmount) {
        showPopup();
    } else {
        // If bet amount is provided, proceed with the spinning process
        Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
        // Insert logic here for the spinning process, if any
    }
});
