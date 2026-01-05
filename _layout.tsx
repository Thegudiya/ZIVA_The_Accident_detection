import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { useEffect } from "react";

// 🔴 IMPORTANT: this import registers the background task
import "../background/accidentBackgroundTask";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // ✅ REGISTER BACKGROUND TASK (MUST BE BEFORE RETURN)
  useEffect(() => {
    const registerBackgroundTask = async () => {
      try {
        const status = await BackgroundFetch.getStatusAsync();

        if (status !== BackgroundFetch.BackgroundFetchStatus.Available) {
          console.log("❌ Background fetch not available");
          return;
        }

        const isRegistered = await TaskManager.isTaskRegisteredAsync(
          "ACCIDENT_BACKGROUND_TASK"
        );

        if (!isRegistered) {
          await BackgroundFetch.registerTaskAsync(
            "ACCIDENT_BACKGROUND_TASK",
            {
              minimumInterval: 15 * 60, // 15 minutes (Android limit)
              stopOnTerminate: false,
              startOnBoot: true,
            }
          );
          console.log("✅ Background accident task registered");
        } else {
          console.log("ℹ️ Background task already registered");
        }
      } catch (err) {
        console.log("❌ Background task registration failed:", err);
      }
    };

    registerBackgroundTask();
  }, []);

  // ✅ UI RENDER
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="alert" options={{ title: "Alert" }} />
        <Stack.Screen name="send-help" options={{ title: "Send Help" }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen name="emergency-contacts" options={{ title: "Emergency Contacts" }} />
        <Stack.Screen name="profile" options={{ title: "Profile" }} />


      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
