import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";

import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";

export default function Signup() {
  const router = useRouter();

  // 🔹 Basic Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔹 User Profile Details
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  const handleSignup = async () => {
    try {
      // ✅ Create Firebase Auth User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      // ✅ Save user profile in Firestore
      await setDoc(doc(db, "users", uid), {
        name,
        address,
        bloodGroup,
        allergies,
        vehicleNumber,
        emergencyContacts: [
          {
            name: "Primary Contact",
            phone: emergencyPhone,
          },
        ],
        createdAt: new Date(),
      });

      // ✅ Go to Home
      router.replace("/");

    } catch (err: any) {
      console.log("SIGNUP ERROR:", err);
      alert(err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {/* 👤 Personal Details */}
      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />

      <TextInput
        placeholder="Blood Group (e.g. B+)"
        value={bloodGroup}
        onChangeText={setBloodGroup}
        style={styles.input}
      />

      <TextInput
        placeholder="Allergies / Medical Issues"
        value={allergies}
        onChangeText={setAllergies}
        style={styles.input}
      />

      <TextInput
        placeholder="Vehicle Number"
        value={vehicleNumber}
        onChangeText={setVehicleNumber}
        style={styles.input}
      />

      <TextInput
        placeholder="Emergency Contact Number"
        value={emergencyPhone}
        onChangeText={setEmergencyPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />

      {/* 🔐 Auth Details */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Password (min 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text onPress={() => router.push("/auth/login")} style={styles.link}>
        Already have an account? Login
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
  },
  button: {
    backgroundColor: "#e53935",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    marginTop: 15,
    color: "#1e88e5",
    textAlign: "center",
  },
});
