import * as Location from 'expo-location';

export const getCurrentLocation = async () => {
  try {
    // ✅ Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return { lat: 0, lng: 0, accuracy: 100 };
    }

    // ✅ Get location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      accuracy: location.coords.accuracy,
    };

  } catch (error) {
    console.log("Location Error:", error);
    return { lat: 0, lng: 0, accuracy: 100 };
  }
};