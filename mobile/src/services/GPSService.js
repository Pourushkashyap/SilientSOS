// Polyfill needed for React Native Geolocation
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

export const getCurrentLocation = async () => {
  return new Promise(async (resolve, reject) => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return resolve({ lat: 0, lng: 0, accuracy: 100 });
      }
    }

    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        resolve({ lat: 0, lng: 0, accuracy: 100 });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
    );
  });
};
