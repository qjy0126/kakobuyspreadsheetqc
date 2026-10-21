import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDKQ5x1dCohEIeppElYY0PsyF7b2hu5hDc",
  authDomain: "kakobuywebsite2.firebaseapp.com",
  projectId: "kakobuywebsite2",
  storageBucket: "kakobuywebsite2.firebasestorage.app",
  messagingSenderId: "433406177038",
  appId: "1:433406177038:web:0a36b678f910c579b0315f",
  measurementId: "G-WLX9KTMDM1",
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);
