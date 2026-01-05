import * as BackgroundFetch from "expo-background-fetch";
import { Accelerometer } from "expo-sensors";
import * as TaskManager from "expo-task-manager";

const TASK_NAME = "ACCIDENT_BACKGROUND_TASK";

let lastMagnitude = 0;

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    return new Promise((resolve) => {
      Accelerometer.setUpdateInterval(1000);

      const subscription = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);

        // Background-safe impact check
        if (magnitude > 4.5 && lastMagnitude < 2) {
          console.log("🚨 Background: possible accident detected");
        }

        lastMagnitude = magnitude;

        subscription.remove();
        resolve(BackgroundFetch.BackgroundFetchResult.NewData);
      });
    });
  } catch (error) {
    console.log("❌ Background task error:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});
