import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCEPFOIevbkY5h0ydt66hNuTcs-2IgZK50",
  authDomain: "accidentalertapp-eb86c.firebaseapp.com",
  projectId: "accidentalertapp-eb86c",
  storageBucket: "accidentalertapp-eb86c.appspot.com",
  messagingSenderId: "161972017298",
  appId: "1:161972017298:web:6eb090d1b35b7dd1116e4b",
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// ✅ Persistent auth for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export default app;
