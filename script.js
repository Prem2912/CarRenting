const firebaseConfig = {
    apiKey: "AIzaSyBWM7lQkp3EdtFGEwM6DjMFkqOYDLGgPJI",
    authDomain: "carrental-50523.firebaseapp.com",
    projectId: "carrental-50523",
    storageBucket: "carrental-50523.firebasestorage.app",
    messagingSenderId: "460800028213",
    appId: "1:460800028213:web:e52239222da771e6458b7c"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const auth = firebase.auth();
  
  const cars = [
    { name: "Maruti Swift", pricePerDay: 1000, image: "https://firebasestorage.googleapis.com/v0/b/carrental-50523.firebasestorage.app/o/cars%2Fmaruti-swift.jpg?alt=media&token=1559ce4a-74c7-43de-8285-6595dc874213" },
    { name: "Hyundai Creta", pricePerDay: 1500, image: "https://firebasestorage.googleapis.com/v0/b/carrental-50523.firebasestorage.app/o/cars%2Fhyundai-creta.jpg?alt=media&token=ceab7a77-6a02-4c0a-a00b-988d63b30f1e" },
    { name: "Toyota Fortuner", pricePerDay: 2500, image: "https://firebasestorage.googleapis.com/v0/b/carrental-50523.firebasestorage.app/o/cars%2Ftoyota-fortuner.jpg?alt=media&token=78b2bc69-550c-41b9-885b-a1d02ec97fa6" }
  ];
  
  const carContainer = document.getElementById('car-container');
const bookingForm = document.getElementById('bookingForm');
const bookingHistory = document.getElementById('bookingHistory');
const searchInput = document.getElementById('searchInput');
const priceFilter = document.getElementById('priceFilter');
const pickupDateInput = document.getElementById('pickupDate');
const dropDateInput = document.getElementById('dropDate');
const adminView = document.getElementById('adminView');
const adminBookingList = document.getElementById('adminBookingList');
  
  function displayCars(filterName = '', filterPrice = '') {
    carContainer.innerHTML = '';
    cars
      .filter(car =>
        car.name.toLowerCase().includes(filterName.toLowerCase()) &&
        (filterPrice === '' || car.pricePerDay <= parseInt(filterPrice))
      )
      .forEach(car => {
        const card = document.createElement('div');
        card.className = 'car-card';
        card.innerHTML = `
          <img src="${car.image}" alt="${car.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Found';">
          <div class="car-info">
            <h3>${car.name}</h3>
            <p>₹<span>${car.pricePerDay}</span> per day</p>
          </div>
        `;
        carContainer.appendChild(card);
      });
  }
  
  searchInput.addEventListener('input', () => {
    displayCars(searchInput.value, priceFilter.value);
  });
  
  priceFilter.addEventListener('change', () => {
    displayCars(searchInput.value, priceFilter.value);
  });
  
function saveBooking(booking) {
  db.collection('bookings').add(booking)
    .then(() => {
      loadBookings();
      if (isAdmin()) loadAllBookings();
    })
    .catch(error => console.error('Error saving booking:', error));
}
  
function loadBookings() {
  bookingHistory.innerHTML = '';
  db.collection('bookings').orderBy('timestamp', 'desc').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const b = doc.data();
        const li = document.createElement('li');
        li.textContent = `${b.name} booked ${b.car} for ${b.days} days. Pickup: ${b.pickupLocation} (${formatDateTime(b.pickupDate)}), Drop: ${b.dropLocation} (${formatDateTime(b.dropDate)})`;
        bookingHistory.appendChild(li);
      });
    });
}

function loadAllBookings() {
  adminBookingList.innerHTML = '';
  db.collection('bookings').orderBy('timestamp', 'desc').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const b = doc.data();
        const li = document.createElement('li');
        li.textContent = `User: ${b.name}, Car: ${b.car}, Days: ${b.days}, Pickup: ${b.pickupLocation} (${formatDateTime(b.pickupDate)}), Drop: ${b.dropLocation} (${formatDateTime(b.dropDate)}), Email: ${b.email || 'N/A'}`;
        adminBookingList.appendChild(li);
      });
    });
}
  
bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const car = document.getElementById('car').value;
  const days = document.getElementById('days').value;
  const name = document.getElementById('name').value;
  const pickupLocation = document.getElementById('pickupLocation').value;
  const dropLocation = document.getElementById('dropLocation').value;
  const pickupDate = pickupDateInput.value;
  const dropDate = dropDateInput.value;
  const userEmail = auth.currentUser ? auth.currentUser.email : null;
  const booking = { car, days, name, pickupLocation, dropLocation, pickupDate, dropDate, email: userEmail, timestamp: new Date() };
  saveBooking(booking);
  bookingForm.reset();
});
  
  function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.createUserWithEmailAndPassword(email, password)
      .then(user => {
        document.getElementById('authStatus').textContent = "Signup Successful";
        showProfileForm();
      })
      .catch(err => document.getElementById('authStatus').textContent = err.message);
  }
  
  // Expose logout for profile modal
window.logout = logout;

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, password)
    .then(user => {
      document.getElementById('authStatus').textContent = "Login Successful";
      showProfileForm();
      loadUserProfile();
    })
    .catch(err => document.getElementById('authStatus').textContent = err.message);
}

function logout() {
  auth.signOut()
    .then(() => {
      document.getElementById('authStatus').textContent = "Logged Out";
      hideProfileForm();
      document.getElementById('profileIcon').style.display = 'none';
    })
    .catch(err => document.getElementById('authStatus').textContent = err.message);
}
// Show/hide profile form logic
function showProfileForm() {
  document.getElementById('profileForm').style.display = '';
  document.getElementById('authInputs').style.display = 'none';
}
function hideProfileForm() {
  document.getElementById('profileForm').style.display = 'none';
  document.getElementById('authInputs').style.display = '';
}

// Save user profile to Firestore
document.getElementById('profileForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('profileName').value;
  const phone = document.getElementById('profilePhone').value;
  const address = document.getElementById('profileAddress').value;
  const user = auth.currentUser;
  if (!user) return;
  db.collection('users').doc(user.uid).set({
    email: user.email,
    name,
    phone,
    address
  }).then(() => {
    document.getElementById('profileStatus').textContent = 'Profile saved!';
  }).catch(err => {
    document.getElementById('profileStatus').textContent = err.message;
  });
});

// Load user profile if exists
function loadUserProfile() {
  const user = auth.currentUser;
  if (!user) return;
  db.collection('users').doc(user.uid).get().then(doc => {
    if (doc.exists) {
      const data = doc.data();
      document.getElementById('profileName').value = data.name || '';
      document.getElementById('profilePhone').value = data.phone || '';
      document.getElementById('profileAddress').value = data.address || '';
      document.getElementById('profileStatus').textContent = '';
      // Store for profile modal
      window.profileData = {
        email: user.email,
        name: data.name || '',
        phone: data.phone || '',
        address: data.address || ''
      };
    } else {
      window.profileData = {
        email: user.email,
        name: '',
        phone: '',
        address: ''
      };
    }
  });
}
  
// Restrict date pickers to today and future
function setMinDateTime(input) {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0,16);
  input.min = local;
}
if (pickupDateInput) setMinDateTime(pickupDateInput);
if (dropDateInput) setMinDateTime(dropDateInput);

function formatDateTime(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleString();
}

// Admin logic: simple check for admin email (customize as needed)
function isAdmin() {
  const adminEmails = ['admin@autozone.com']; // Add more admin emails as needed
  return auth.currentUser && adminEmails.includes(auth.currentUser.email);
}

auth.onAuthStateChanged(user => {
  const profileIcon = document.getElementById('profileIcon');
  if (user) {
    showProfileForm();
    loadUserProfile();
    profileIcon.style.display = '';
  } else {
    hideProfileForm();
    profileIcon.style.display = 'none';
  }
  if (isAdmin()) {
    adminView.style.display = '';
    loadAllBookings();
  } else {
    adminView.style.display = 'none';
  }
});

displayCars();
loadBookings();

function loadUserBookings() {
  const user = auth.currentUser;
  const bookingHistory = document.getElementById('bookingHistory');
  bookingHistory.innerHTML = '';
  if (!user) {
    bookingHistory.innerHTML = '<li>Please login to see your booking history.</li>';
    return;
  }
  db.collection('bookings').where('email', '==', user.email).orderBy('timestamp', 'desc').get()
    .then(snapshot => {
      if (snapshot.empty) {
        bookingHistory.innerHTML = '<li>No bookings found.</li>';
        return;
      }
      snapshot.forEach(doc => {
        const b = doc.data();
        const li = document.createElement('li');
        li.textContent = `${b.name} booked ${b.car} for ${b.days} days. Pickup: ${b.pickupLocation} (${formatDateTime(b.pickupDate)}), Drop: ${b.dropLocation} (${formatDateTime(b.dropDate)})`;
        bookingHistory.appendChild(li);
      });
    });
}
window.loadUserBookings = loadUserBookings;
