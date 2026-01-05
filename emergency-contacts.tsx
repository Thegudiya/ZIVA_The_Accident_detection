import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export default function EmergencyContactsScreen() {
  const router = useRouter();

  const [contacts, setContacts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setContacts(snap.data().emergencyContacts || []);
      }
    } catch (e) {
      console.log("Load contacts error:", e);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async () => {
    if (!name || !phone) {
      Alert.alert("Error", "Enter name and phone");
      return;
    }

    const newContacts = [...contacts, { name, phone }];

    await saveContacts(newContacts);
    setContacts(newContacts);
    setName("");
    setPhone("");
  };

  const deleteContact = async (index: number) => {
    const newContacts = contacts.filter((_, i) => i !== index);
    await saveContacts(newContacts);
    setContacts(newContacts);
  };

  const saveContacts = async (newContacts: any[]) => {
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      emergencyContacts: newContacts,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>

      <FlatList
        data={contacts}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.contactItem}>
            <Text>
              {item.name} - {item.phone}
            </Text>
            <Button
              title="Delete"
              color="red"
              onPress={() => deleteContact(index)}
            />
          </View>
        )}
        ListEmptyComponent={!loading ? <Text>No contacts added</Text> : null}
      />

      <Text style={styles.subTitle}>Add New Contact</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <Button title="Add Contact" onPress={addContact} />

      {/* 🔙 BACK TO HOME BUTTON */}
      <View style={{ marginTop: 30 }}>
        <Button
          title="Back to Home"
          onPress={() => router.replace("/(tabs)")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subTitle: { marginTop: 20, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 8,
    borderRadius: 6,
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
});
