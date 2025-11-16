// Firebase Configuration
// Replace these with your Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyACvTNrTliMQ-yVtsDCaBfrFwxBkY9NcFw",
  authDomain: "placademy.firebaseapp.com",
  databaseURL: "https://placademy-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "placademy",
  storageBucket: "placademy.firebasestorage.app",
  messagingSenderId: "899779526003",
  appId: "1:899779526003:web:0dba69aa94c758305b1906"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

console.log('Firebase initialized successfully');