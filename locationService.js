import * as Location from "expo-location";

export async function getCurrentLocation() {
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== "granted") {
    console.log("❌ Location permission denied");
    return null;
}

return await Location.getCurrentPositionAsync({});
}
