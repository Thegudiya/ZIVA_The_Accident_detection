import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import useAccidentDetector from "../../hooks/useAccidentDetector";
import { saveAccident } from "../../services/accidentService";
import { getCurrentLocation } from "../../services/locationService";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

export default function HomeScreen() {
  const router = useRouter();

  const [userReady, setUserReady] = useState(false);
  const [detectorEnabled, setDetectorEnabled] = useState(false);

  // 🔒 SAFETY LOCK
  const [accidentHandled, setAccidentHandled] = useState(false);

  // 🔐 AUTH GUARD
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/auth/login");
      } else {
        setUserReady(true);
      }
    });

    return unsubscribe;
  }, []);

  // 👁️ ENABLE DETECTOR ONLY WHEN HOME SCREEN IS FOCUSED
  useFocusEffect(
    useCallback(() => {
      setDetectorEnabled(true);
      setAccidentHandled(false); // 🔓 reset when coming back to Home

      return () => {
        setDetectorEnabled(false);
      };
    }, [])
  );

  // 🚨 ACCIDENT HANDLER (SAFE)
  async function handleAccidentDetected() {
    if (accidentHandled) return;
    setAccidentHandled(true);

    const location = await getCurrentLocation();
    if (!location) return;

    await saveAccident(location.coords);
    router.push("/alert");
  }

  // 🚗 START ACCIDENT DETECTOR
  useAccidentDetector(handleAccidentDetected, userReady && detectorEnabled);

  // 🚪 LOGOUT HANDLER
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace("/auth/login");
            } catch (err) {
              console.log("Logout error:", err);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🚨 Accident Detection App</Text>

        <Text style={styles.statusActive}>● Monitoring Active</Text>

        <Text style={styles.info}>
          Keep this app open while travelling.
        </Text>

        <Text style={styles.warning}>
          Shake the phone HARD to simulate an accident.
        </Text>

        {/* 🆘 MANAGE EMERGENCY CONTACTS */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push("/emergency-contacts" as any)}
        >
          <Text style={styles.linkButtonText}>
            Manage Emergency Contacts
          </Text>
        </TouchableOpacity>

        {/* 👤 VIEW PROFILE */}
        <TouchableOpacity
          style={[styles.linkButton, { marginTop: 10 }]}
          onPress={() => router.push("/profile" as any)}
        >
          <Text style={styles.linkButtonText}>
            View My Profile
          </Text>
        </TouchableOpacity>

        {/* 🚪 LOGOUT */}
        <TouchableOpacity
          style={[styles.logoutButton, { marginTop: 16 }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statusActive: {
    color: "green",
    fontWeight: "bold",
    marginBottom: 12,
  },
  info: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  warning: {
    fontSize: 14,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  linkButton: {
    backgroundColor: "#e53935",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    width: "100%",
  },
  linkButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#444",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    width: "100%",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
