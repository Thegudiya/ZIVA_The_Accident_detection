import { Audio } from "expo-av";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

const COUNTDOWN_SECONDS = 15;

export default function AlertScreen() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [cancelled, setCancelled] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);


  // 🔊 START ALARM + COUNTDOWN
  useEffect(() => {
    let mounted = true;

    const startAlarm = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/alarm.mp3"),
        { shouldPlay: true, isLooping: true }
      );

      if (mounted) {
        soundRef.current = sound;
      }
    };

    startAlarm();

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleAutoEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      mounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  // 🚨 AUTO EMERGENCY (AFTER COUNTDOWN)
  const handleAutoEmergency = async () => {
    if (cancelled) return;

    if (timerRef.current) clearInterval(timerRef.current);
    if (soundRef.current) await soundRef.current.unloadAsync();

    // 📞 Call emergency number
    await Linking.openURL("tel:7676544053");

    // 📩 Go to SMS + GPS screen
    router.replace("/send-help");
  };

  // ❌ USER CANCELS ALERT
  const cancelAlert = async () => {
    setCancelled(true);

    if (timerRef.current) clearInterval(timerRef.current);
    if (soundRef.current) await soundRef.current.unloadAsync();

    router.replace("/(tabs)");
  };

  // 🚑 USER SENDS HELP MANUALLY
  const sendHelpNow = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (soundRef.current) await soundRef.current.unloadAsync();

    await Linking.openURL("tel:7676544053");
    router.replace("/send-help");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚠️ Possible Accident Detected!</Text>
      <Text style={styles.timer}>{secondsLeft}s</Text>

      <Button title="I AM OK (Cancel)" onPress={cancelAlert} />
      <View style={{ height: 10 }} />
      <Button title="SEND HELP NOW" onPress={sendHelpNow} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  timer: { fontSize: 40, fontWeight: "bold", marginBottom: 20 },
});
