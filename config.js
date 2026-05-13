// Firebase Configuration
// Replace these values with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyDmvKh7lc176cb7AuWwpb9sKP7YSrjCUcU",
  authDomain: "pgachampionshipbackend.firebaseapp.com",
  projectId: "pgachampionshipbackend",
  storageBucket: "pgachampionshipbackend.firebasestorage.app",
  messagingSenderId: "650723121638",
  appId: "1:650723121638:web:ad1abbd94c7704f9b15e27",
  measurementId: "G-YNW7QVEG2Q"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Admin password (in production, use Firebase Authentication)
const ADMIN_PASSWORD = "pga2026admin";

// ESPN API Configuration
const ESPN_API_URL = "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?event=401811947";

// Made with Bob
