// ✅ Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBi5bXxOygi0xsx22A6HCz2BW1e6vhFMgA",
    authDomain: "test-algo-public.firebaseapp.com",
    projectId: "test-algo-public",
    storageBucket: "test-algo-public.appspot.com",
    messagingSenderId: "510975939116",
    appId: "1:510975939116:web:4d51fd30f0d0da025df789"
};

// ✅ Initialize Firebase & Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ✅ Initialize Telegram WebApp
let tg = window.Telegram.WebApp;
let userId = tg.initDataUnsafe?.user?.id || null;

// ✅ Debugging Function (Shows Logs on Screen)
function debugLog(message) {
    let debugBox = document.getElementById("debug-box");
    if (debugBox) {
        debugBox.innerHTML += `<br>➜ ${message}`;
    }
}

// ✅ Update Username in UI
document.getElementById("username").innerText = tg.initDataUnsafe?.user?.first_name || "User";
debugLog(`✅ Telegram WebApp Loaded`);
debugLog(`User ID: ${userId}`);

// ✅ Function to Fetch User Wallet Address
async function fetchUserAddress() {
    const balanceText = document.getElementById("user-wallet");

    if (!userId) {
        debugLog("❌ User ID not found.");
        balanceText.innerText = "Error";
        return;
    }

    try {
        const userIdString = userId.toString();
        debugLog(`Fetching wallet address for ${userIdString}...`);

        const docRef = db.collection("user_addresses").doc(userIdString);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            debugLog("❌ Wallet address not found in Firestore.");
            balanceText.innerText = "Not Linked";
            return;
        }

        const walletAddress = docSnap.data().address;
        debugLog(`✅ User Wallet Address: ${walletAddress}`);

        // 🔥 Update UI with Wallet Address
        balanceText.innerText = walletAddress;

    } catch (error) {
        debugLog(`❌ Error fetching wallet address: ${error.message}`);
        balanceText.innerText = "Error";
    }
}

// ✅ Fetch Wallet Address on Page Load
fetchUserAddress();
