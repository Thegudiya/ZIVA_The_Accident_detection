import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export async function saveAccident(coords) {
try {
    await addDoc(collection(db, "accidents"), {
latitude: coords.latitude,
longitude: coords.longitude,
severity: "High",
status: "Alert Sent",
timestamp: serverTimestamp(),
    });

    console.log("✅ Accident data saved to Firestore");
} catch (error) {
    console.error("❌ Error saving accident:", error);
}
}
