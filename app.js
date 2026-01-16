// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    doc, 
    updateDoc, 
    deleteDoc,
    serverTimestamp,
    query,
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// TODO: Replace the following with your app's Firebase project configuration
// You can get this from the Firebase Console -> Project Settings -> General -> Your apps -> SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyAy4L_QncyzK16jPHGcXwR8QfTOT2fNqvM",
  authDomain: "hospital-dashboard-95f62.firebaseapp.com",
  projectId: "hospital-dashboard-95f62",
  storageBucket: "hospital-dashboard-95f62.firebasestorage.app",
  messagingSenderId: "812898150184",
  appId: "1:812898150184:web:ab4e688e554f160974521d",
  measurementId: "G-Q45V2JMC0R"
};

// Initialize Firebase
let app;
let db;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized");
} catch (e) {
    console.error("Firebase initialization error. Make sure you updated the firebaseConfig object in app.js", e);
    alert("Please update the firebaseConfig in app.js with your credentials!");
}

// DOM Elements
const hospitalList = document.getElementById('hospitalList');
const searchInput = document.getElementById('search');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const formInputs = {
    id: document.getElementById('hospitalId'),
    name: document.getElementById('name'),
    phone: document.getElementById('phone'),
    address: document.getElementById('address'),
    beds: document.getElementById('beds'),
    icu: document.getElementById('icu'),
    oxygen: document.getElementById('oxygen'),
    blood: document.getElementById('blood'),
    doctor: document.getElementById('doctor'),
    notes: document.getElementById('notes')
};

let hospitalsData = [];

// Listen for real-time updates
if (db) {
    const q = query(collection(db, "hospitals"), orderBy("updatedAt", "desc"));
    
    onSnapshot(q, (snapshot) => {
        hospitalsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderHospitals(hospitalsData);
    }, (error) => {
        console.error("Error getting documents: ", error);
        // Fallback or error message
        hospitalList.innerHTML = `<tr><td colspan="5" style="text-align:center; color: red;">Error loading data. Check console.</td></tr>`;
    });
}

// Render function
function renderHospitals(hospitals) {
    hospitalList.innerHTML = '';
    
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = hospitals.filter(h => 
        h.name.toLowerCase().includes(searchTerm) || 
        h.address.toLowerCase().includes(searchTerm)
    );

    filtered.forEach(h => {
        const row = document.createElement('tr');
        
        // Format date
        let updatedStr = "N/A";
        if (h.updatedAt && h.updatedAt.toDate) {
            updatedStr = h.updatedAt.toDate().toLocaleString();
        } else if (h.updatedAt) {
            updatedStr = new Date(h.updatedAt).toLocaleString();
        }

        // Doctor last update
        let doctorUpdatedStr = "N/A";
        if (h.doctorUpdatedAt && h.doctorUpdatedAt.toDate) {
            doctorUpdatedStr = h.doctorUpdatedAt.toDate().toLocaleString();
        } else if (h.doctorUpdatedAt) {
            doctorUpdatedStr = new Date(h.doctorUpdatedAt).toLocaleString();
        }

        row.innerHTML = `
            <td data-label="Hospital"><strong>${h.name}</strong><br><small>${h.address}</small></td>
            <td data-label="Details">
                <a href="tel:${h.phone}" class="icon-btn"><svg class="icon"><use href="#phoneIcon"/></svg> Call</a>
                <a href="https://maps.google.com/?q=${encodeURIComponent(h.name + ' ' + h.address)}" target="_blank" class="icon-btn"><svg class="icon"><use href="#locationIcon"/></svg> Map</a>
                <button class="icon-btn" onclick="sendAlert('${h.id}')">🚨 Alert</button>
            </td>
            <td data-label="Availability">
                <div>🛏️ Beds: <b>${h.beds || 0}</b> / ICU: <b>${h.icu || 0}</b></div>
                <div>💧 Oxygen: <b>${h.oxygen || 0}</b> LPM</div>
                <div>🩸 Blood: <b>${h.blood || 0}</b> Units</div>
            </td>
            <td data-label="Doctor">
                ${h.doctor ? `👨‍⚕️ ${h.doctor}` : '<span style="color:#aaa">Not specified</span>'}
                <div style="margin-top:6px;color:#666;font-size:12px;">Last availability update: <b>${doctorUpdatedStr}</b></div>
            </td>
            <td data-label="Actions">
                <button class="btn-small" onclick="editHospital('${h.id}')" style="background:#ffc107; color:black;">Edit</button>
                <button class="btn-small" onclick="deleteHospital('${h.id}')" style="background:#dc3545;">Delete</button>
            </td>
        `;
        hospitalList.appendChild(row);
    });
}

// Search Handler
searchInput.addEventListener('input', () => {
    renderHospitals(hospitalsData);
});

// Save (Add/Edit) Handler
saveBtn.addEventListener('click', async () => {
    const data = {
        name: formInputs.name.value,
        phone: formInputs.phone.value,
        address: formInputs.address.value,
        beds: Number(formInputs.beds.value),
        icu: Number(formInputs.icu.value),
        oxygen: Number(formInputs.oxygen.value),
        blood: Number(formInputs.blood.value),
        doctor: formInputs.doctor.value,
        notes: formInputs.notes.value,
        updatedAt: serverTimestamp(),
        doctorUpdatedAt: serverTimestamp()
    };

    if (!data.name) {
        alert("Hospital Name is required");
        return;
    }

    saveBtn.disabled = true;
    saveBtn.innerText = "Saving...";

    try {
        if (formInputs.id.value) {
            // Update
            const docRef = doc(db, "hospitals", formInputs.id.value);
            await updateDoc(docRef, data);
            alert("Hospital updated successfully!");
        } else {
            // Add
            await addDoc(collection(db, "hospitals"), data);
            alert("Hospital added successfully!");
        }
        clearForm();
    } catch (e) {
        console.error("Error saving document: ", e);
        alert("Error saving data: " + e.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = "Save Hospital";
    }
});

// Clear Form
clearBtn.addEventListener('click', clearForm);

function clearForm() {
    formInputs.id.value = '';
    formInputs.name.value = '';
    formInputs.phone.value = '';
    formInputs.address.value = '';
    formInputs.beds.value = '';
    formInputs.icu.value = '';
    formInputs.oxygen.value = '';
    formInputs.blood.value = '';
    formInputs.doctor.value = '';
    formInputs.notes.value = '';
    saveBtn.innerText = "Save Hospital";
    window.scrollTo(0, 0);
}

// Global functions for inline onclick handlers
window.editHospital = (id) => {
    const hospital = hospitalsData.find(h => h.id === id);
    if (hospital) {
        formInputs.id.value = hospital.id;
        formInputs.name.value = hospital.name;
        formInputs.phone.value = hospital.phone;
        formInputs.address.value = hospital.address;
        formInputs.beds.value = hospital.beds;
        formInputs.icu.value = hospital.icu;
        formInputs.oxygen.value = hospital.oxygen;
        formInputs.blood.value = hospital.blood;
        formInputs.doctor.value = hospital.doctor || '';
        formInputs.notes.value = hospital.notes || '';
        saveBtn.innerText = "Update Hospital";
        window.scrollTo(0, 0);
    }
};

window.deleteHospital = async (id) => {
    if (confirm("Are you sure you want to delete this hospital?")) {
        try {
            await deleteDoc(doc(db, "hospitals", id));
        } catch (e) {
            console.error("Error removing document: ", e);
            alert("Error removing document: " + e.message);
        }
    }
};

// Send Alert (SMS/WhatsApp) with prefilled emergency message
window.sendAlert = (id) => {
    const h = hospitalsData.find(x => x.id === id);
    if (!h) return;

    const message = "EMERGENCY ALERT: Patient is coming to your hospital now. Please prepare for immediate treatment.";

    const encoded = encodeURIComponent(message);
    const phoneDigits = (h.phone || '').replace(/[^+0-9]/g, '');

    // Prefer WhatsApp (most reliable to include full message), fallback to SMS
    const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encoded}`;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const smsUrlPrimary = isIOS ? `sms:${phoneDigits}&body=${encoded}` : `smsto:${phoneDigits}?body=${encoded}`;
    const smsUrlFallback = `sms:${phoneDigits}?body=${encoded}`;

    // Open WhatsApp first
    window.open(whatsappUrl, '_blank');

    // Also open SMS as secondary option shortly after (covers cases without WhatsApp)
    setTimeout(() => {
        const a = document.createElement('a');
        a.href = smsUrlPrimary;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, 300);

    // Final fallback try
    setTimeout(() => {
        const a2 = document.createElement('a');
        a2.href = smsUrlFallback;
        document.body.appendChild(a2);
        a2.click();
        document.body.removeChild(a2);
    }, 800);
};
