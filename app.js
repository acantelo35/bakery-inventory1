// Firebase config (replace with YOUR config from Firebase console)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const inventoryList = document.getElementById("inventory-list");
const addForm = document.getElementById("add-form");
const updateForm = document.getElementById("update-form");

// Format date as YYYY-MM-DD
function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

// Render inventory table rows
function renderInventory(items) {
  inventoryList.innerHTML = "";
  items.forEach(doc => {
    const data = doc.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${doc.id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</td>
      <td>${data.quantity}</td>
      <td>${data.date}</td>
    `;
    inventoryList.appendChild(tr);
  });
}

// Listen to real-time updates
db.collection("inventory").orderBy("date", "desc").onSnapshot(snapshot => {
  renderInventory(snapshot.docs);
});

// Add new item
addForm.addEventListener("submit", e => {
  e.preventDefault();
  const item = document.getElementById("item").value.trim().toLowerCase();
  const quantity = parseInt(document.getElementById("quantity").value);
  const date = formatDate(new Date());

  if (!item || quantity <= 0) return alert("Please enter valid item and quantity.");

  const itemRef = db.collection("inventory").doc(item);
  itemRef.get().then(doc => {
    if (doc.exists) {
      // Update quantity by adding
      const newQuantity = doc.data().quantity + quantity;
      itemRef.set({ quantity: newQuantity, date }, { merge: true });
    } else {
      // New item
      itemRef.set({ quantity, date });
    }
  });

  addForm.reset();
});

// Update item quantity
updateForm.addEventListener("submit", e => {
  e.preventDefault();
  const item = document.getElementById("update-item").value.trim().toLowerCase();
  const quantity = parseInt(document.getElementById("update-quantity").value);
  const date = formatDate(new Date());

  if (!item || quantity < 0) return alert("Please enter valid item and quantity.");

  const itemRef = db.collection("inventory").doc(item);
  itemRef.get().then(doc => {
    if (doc.exists) {
      itemRef.set({ quantity, date }, { merge: true });
    } else {
      alert(`Item "${item}" does not exist.`);
    }
  });

  updateForm.reset();
});
