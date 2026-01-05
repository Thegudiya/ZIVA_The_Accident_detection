import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setProfile(snap.data());
      }
    } catch (error) {
      console.log("Profile load error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text>No profile data found</Text>
      </View>
    );
  }

  // ✅ SAFE EMAIL HANDLING (FIX)
  const email = auth.currentUser?.email || "";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>👤 My Profile</Text>

        <ProfileItem label="Name" value={profile.name} />
        <ProfileItem label="Email" value={email} />
        <ProfileItem label="Address" value={profile.address} />
        <ProfileItem label="Blood Group" value={profile.bloodGroup} />
        <ProfileItem label="Allergies / Medical" value={profile.allergies} />
        <ProfileItem label="Vehicle Number" value={profile.vehicleNumber} />

        <Text style={styles.sectionTitle}>🚨 Emergency Contacts</Text>
        {profile.emergencyContacts?.length > 0 ? (
          profile.emergencyContacts.map((c: any, index: number) => (
            <Text key={index} style={styles.contactText}>
              • {c.name}: {c.phone}
            </Text>
          ))
        ) : (
          <Text style={styles.contactText}>No emergency contacts added</Text>
        )}

        <View style={{ marginTop: 30 }}>
          <Button
            title="Back to Home"
            onPress={() => router.replace("/(tabs)")}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "-"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  sectionTitle: {
    marginTop: 20,
    fontWeight: "bold",
    fontSize: 16,
  },
  item: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: "#666",
  },
  value: {
    fontSize: 15,
    fontWeight: "500",
  },
  contactText: {
    marginLeft: 10,
    marginTop: 4,
  },
});
