import * as Linking from "expo-linking";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as SMS from "expo-sms";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Text,
  View,
} from "react-native";

import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export default function SendHelpScreen() {
  const router = useRouter();

  const [statusText, setStatusText] = useState(
    "🚨 Preparing emergency alert..."
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sendHelp();
  }, []);

  const sendHelp = async () => {
    try {
      // 🔐 AUTH CHECK
      const user = auth.currentUser;
      if (!user) {
        setStatusText("❌ User not authenticated.");
        setLoading(false);
        return;
      }

      // 👤 LOAD USER PROFILE
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) {
        setStatusText("❌ User profile not found.");
        setLoading(false);
        return;
      }

      const profile: any = snap.data();
      const contacts = profile.emergencyContacts || [];

      if (contacts.length === 0) {
        setStatusText("❌ No emergency contacts found.");
        setLoading(false);
        return;
      }

      // 📍 LOCATION PERMISSION
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setStatusText("❌ Location permission denied.");
        setLoading(false);
        return;
      }

      setStatusText("📡 Fetching live location...");

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;

      // 📩 EMERGENCY MESSAGE
      const message = `
🚨 ROAD ACCIDENT ALERT 🚨

👤 Name: ${profile.name}
🩸 Blood Group: ${profile.bloodGroup}
⚠ Allergies: ${profile.allergies}
🚗 Vehicle No: ${profile.vehicleNumber}

📍 Live Location:
${mapLink}

Victim is unresponsive.
Please send help immediately.
`;

      // 📞 CALL PRIMARY EMERGENCY CONTACT
      const primaryNumber = contacts[0].phone;
      setStatusText("📞 Calling emergency contact...");
      await Linking.openURL(`tel:${primaryNumber}`);

      // 📩 SMS TO ALL CONTACTS + 108
      const smsNumbers = contacts.map((c: any) => c.phone);
      smsNumbers.push("108"); // Ambulance

      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        setStatusText("❌ SMS not supported on this device.");
        setLoading(false);
        return;
      }

      setStatusText("📩 Opening SMS app...");
      await SMS.sendSMSAsync(smsNumbers, message);

      setStatusText(
        "✅ Emergency alert prepared.\nPlease tap SEND in SMS app."
      );
      setLoading(false);

    } catch (error) {
      console.log("Send help error:", error);
      Alert.alert("Error", "Failed to send emergency alert.");
      setStatusText("❌ Failed to send emergency alert.");
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      {loading && <ActivityIndicator size="large" />}

      <Text
        style={{
          marginTop: 20,
          fontSize: 16,
          textAlign: "center",
        }}
      >
        {statusText}
      </Text>

      <View style={{ marginTop: 30 }}>
        <Button
          title="Back to Home"
          onPress={() => router.replace("/(tabs)")}
        />
      </View>
    </View>
  );
}
