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

// Function to show the Telegram popup instead of an error message
function showPopup(title, message) {
    Telegram.WebApp.showPopup({
        title: title,
        message: message,
        buttons: [
            { id: 'retry', type: 'default', text: 'Try Again' },
            { type: 'cancel' }
        ]
    }, function (buttonId) {
        if (buttonId === 'retry') {
            console.log("'Try Again' selected");
        }
    });
}

// Function to fetch balance dynamically
function fetchBalance(walletAddress, callback) {
    let url = `https://mainnet-idx.algonode.cloud/v2/accounts/${walletAddress}`;

    console.log("Fetching balance for address:", walletAddress);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.account) {
                let balance = parseFloat(data.account.amount) / 1e6; // Convert to ALGO
                console.log("Fetched Balance:", balance);
                callback(balance);
            } else {
                console.error("Invalid API response: No account data.");
                callback(0);
            }
        })
        .catch(error => {
            console.error("Balance fetch error:", error);
            callback(0);
        });
}

// Function to validate and spin
function validateAndSpin() {
    const betAmountInput = document.getElementById("bet-amount").value.trim();
    const betAmount = parseFloat(betAmountInput);

    if (isNaN(betAmount) || betAmount <= 0) {
        showPopup("Error", "Please enter a valid bet amount.");
        return;
    }

    const isHeadsSelected = document.getElementById("heads").classList.contains("active");
    const isTailsSelected = document.getElementById("tails").classList.contains("active");

    if (!isHeadsSelected && !isTailsSelected) {
        showPopup("Error", "Please select either Heads or Tails.");
        return;
    }

    let walletAddress = getWalletAddress();
    if (!walletAddress) {
        showPopup("Error", "No wallet address linked.");
        return;
    }

    // Fetch balance and check bet amount
    fetchBalance(walletAddress, function (userBalance) {
        console.log("User Balance:", userBalance, "Bet Amount:", betAmount);

        if (betAmount > userBalance) {
            showPopup("Insufficient Balance", "Your balance is too low for this bet.");
        } else {
            console.log("Bet confirmed:", betAmount, isHeadsSelected ? "Heads" : "Tails");
            startSpin(betAmount, isHeadsSelected ? "Heads" : "Tails");
        }
    });
}

// Attach event listener to the spin button
document.querySelector(".spin-button").addEventListener("click", validateAndSpin);

// Function to start the spin with background blur, fast spinning, and haptic feedback
function startSpin(betAmount, selectedOption) {
    console.log("Starting spin with bet amount: " + betAmount + " and selected option: " + selectedOption);

    // 1. Blur the background
    document.body.classList.add("blurred");

    // 2. Set the Lottie animation to spin faster
    let coinSpin = document.getElementById("coin-lottie"); // Assuming your coin animation is identified as 'coin-lottie'
    let lottieInstance = lottie.loadAnimation({
        container: coinSpin,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'path/to/coin-spin.json'  // Replace with your Lottie JSON file path
    });
    
    // Increase the speed of the animation (e.g., speed up by a factor of 2)
    lottieInstance.setSpeed(2);  // Adjust this value as per your need (2x speed)

    // 3. Start Haptic Feedback in a repeating pattern during spin
    let hapticInterval = setInterval(() => {
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]); // Quick vibration feedback
        }
    }, 100);  // Repeating vibration every 100ms

    // Simulate the spin (you can replace this with your actual game logic)
    setTimeout(() => {
        // Stop haptic feedback
        clearInterval(hapticInterval);
        
        // Spin result (randomize outcome between Heads and Tails)
        const outcome = Math.random() < 0.5 ? "Heads" : "Tails";
        console.log("Spin result: " + outcome);

        // 4. Stop the animation, reset speed
        lottieInstance.setSpeed(1);  // Reset to normal speed (or can continue at a slower speed)

        // Show result popup
        if (outcome === selectedOption) {
            showPopup("You Win!", `Congratulations! You won the bet with ${outcome}.`);
        } else {
            showPopup("You Lose!", `Sorry, you lost the bet. The result was ${outcome}.`);
        }

        // 5. Remove background blur
        document.body.classList.remove("blurred");

    }, 2000);  // Adjust the duration to match your animation speed
}
