
import { initializeApp,getApps,getApp } from "firebase/app";
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAVB1jk1VfAXTuPVBw1SJKpBgw-7RbP6xg",
    authDomain: "voclalhire.firebaseapp.com",
    projectId: "voclalhire",
    storageBucket: "voclalhire.firebasestorage.app",
    messagingSenderId: "263659592399",
    appId: "1:263659592399:web:02c47351fdbdc5199935ba",
    measurementId: "G-VXEGZFWLXV"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig): getApp();
export const auth = getAuth(app);
export const db = getFirestore(app )