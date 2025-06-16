// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZlZT8eXV28fTjJJie9CdHMDmX4aqGNnk",
  authDomain: "smartexpensetracker-5e945.firebaseapp.com",
  projectId: "smartexpensetracker-5e945",
  storageBucket: "smartexpensetracker-5e945.appspot.com",
  messagingSenderId: "159918559999",
  appId: "1:159918559999:web:09467f3c9f8d5505ac32ca",
  measurementId: "G-T9XBHE8QW2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);