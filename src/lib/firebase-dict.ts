import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_DICT_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_DICT_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_DICT_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_DICT_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_DICT_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_DICT_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_DICT_MEASUREMENT_ID
};

// Named "dict" to avoid conflict with the default DTC Firebase app
export const dictApp = initializeApp(firebaseConfig, "dict");
export const dictAuth = getAuth(dictApp);
export const dictDb = getFirestore(dictApp);
