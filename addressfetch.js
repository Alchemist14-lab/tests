// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBi5bXxOygi0xsx22A6HCz2BW1e6vhFMgA",
    authDomain: "test-algo-public.firebaseapp.com",
    projectId: "test-algo-public",
    storageBucket: "test-algo-public.appspot.com",
    messagingSenderId: "510975939116",
    appId: "1:510975939116:web:4d51fd30f0d0da025df789"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Fetch the user ID from Telegram Web App
let userId = window.Telegram.WebApp.initDataUnsafe?.user?.id || null;

console.log("User ID being used: " + userId);

// If there's a valid userId, fetch the address from Firestore
if (userId) {
    db.collection("user_addresses").where("user_id", "==", Number(userId))  // Ensure the user_id is a number
        .get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                console.log("No such user document found!");
                document.getElementById("wallet-address").innerText = "No address found.";
            } else {
                querySnapshot.forEach(doc => {
                    console.log("Firestore document fetched for userId: " + userId);
                    const userAddress = doc.data().address;
                    console.log("User Address: ", userAddress);
                    document.getElementById("wallet-address").innerText = `Wallet Address: ${userAddress}`;
                });
            }
        })
        .catch(error => {
            console.error("Error fetching user data:", error);
        });
} else {
    console.log("No user ID found from Telegram Web App");
}
