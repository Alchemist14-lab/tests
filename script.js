// ✅ Load Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ✅ Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBi5bXxOygi0xsx22A6HCz2BW1e6vhFMgA",
    authDomain: "test-algo-public.firebaseapp.com",
    projectId: "test-algo-public",
    storageBucket: "test-algo-public.appspot.com",
    messagingSenderId: "510975939116",
    appId: "1:510975939116:web:4d51fd30f0d0da025df789"
};

// ✅ Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Initialize Telegram WebApp
let tg = window.Telegram.WebApp;
let userId = tg.initDataUnsafe?.user?.id || null;

// ✅ Update Username in UI
document.getElementById("username").innerText = tg.initDataUnsafe?.user?.first_name || "User";

// ✅ Load Coin Flip Animation
var animation = lottie.loadAnimation({
    container: document.getElementById("coin-animation"),
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: "animation.json"
});

// ✅ Fetch User's ALGO Balance
async function fetchBalance() {
    if (!userId) {
        console.error("❌ User ID not found.");
        document.getElementById("algo-balance").innerText = "N/A";
        return;
    }

    try {
        const userIdString = userId.toString();

        // 🔥 Fetch wallet address from Firestore
        const docRef = doc(db, "user_addresses", userIdString);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.error("❌ Wallet address not found in Firestore.");
            document.getElementById("algo-balance").innerText = "N/A";
            return;
        }

        const walletAddress = docSnap.data().address; // Adjusted to match Firestore key
        console.log("✅ User Wallet Address:", walletAddress);

        // 🔥 Fetch ALGO balance from Algorand API
        const response = await fetch(`https://mainnet-idx.algonode.cloud/v2/accounts/${walletAddress}`);
        const data = await response.json();

        let balance = 0;
        if (data.account) {
            balance = data.account.amount / 1e6; // Convert from microAlgos to ALGO
        }

        console.log("✅ User Balance:", balance);
        document.getElementById("algo-balance").innerText = balance.toFixed(2); // Show balance with 2 decimal places

    } catch (error) {
        console.error("❌ Error fetching balance:", error);
        document.getElementById("algo-balance").innerText = "Error";
    }
}

// ✅ Fetch balance on page load
fetchBalance();

// ✅ Refresh balance when Withdraw button is pressed
document.querySelector(".withdraw-button").addEventListener("click", function() {
    Telegram.WebApp.HapticFeedback.impactOccurred('soft');
    fetchBalance();
});

// ✅ Handle Heads & Tails Button Selection with Haptic Feedback
document.querySelectorAll(".coin-button").forEach(button => {
    button.addEventListener("click", function() {
        document.querySelectorAll(".coin-button").forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");
        Telegram.WebApp.HapticFeedback.impactOccurred('light');
    });
});

// ✅ Handle Spin Button with HEAVY Haptic Feedback
document.querySelector(".spin-button").addEventListener("click", function() {
    Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
});
