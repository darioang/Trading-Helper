import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6v0vQltlfVj9vDbSOlDA_XO18zhC8Nks",
  authDomain: "trading-helper-408bd.firebaseapp.com",
  databaseURL: "https://trading-helper-408bd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "trading-helper-408bd",
  storageBucket: "trading-helper-408bd.appspot.com",
  messagingSenderId: "529674965096",
  appId: "1:529674965096:web:55224b48a295f4c8986bdd"
};

// Use this to initialize the firebase App
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore();

export const auth = firebase.auth();


 
