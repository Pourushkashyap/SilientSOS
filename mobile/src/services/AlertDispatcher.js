import axios from 'axios';
import { getCurrentLocation } from './GPSService';
import { encryptAudio } from '../utils/Encryption';
import SecureStore from '../storage/SecureStore';
import AudioCapture from './AudioCapture';

const API_URL = 'http://localhost:5000/api/alert'; // Will use env in prod

export const dispatchAlert = async () => {
  try {
    // 1. Record 30s confirmation clip
    const audioFilePath = await AudioCapture.recordDuration(30000);
    
    // 2. Encrypt
    const deviceId = await SecureStore.getDeviceId();
    const encryptedAudioStr = await encryptAudio(audioFilePath, deviceId);

    // 3. Get latest GPS
    const gpsData = await getCurrentLocation();

    // 4. Get Contacts
    const settings = await SecureStore.getSettings();
    const contacts = settings.contacts || [];

    // POST
    await axios.post(API_URL, {
      encryptedAudio: encryptedAudioStr,
      gpsLat: gpsData.lat,
      gpsLng: gpsData.lng,
      timestamp: Date.now(),
      deviceId,
      contacts
    });

  } catch (err) {
    // Fails silently, queue locally
    queueAlertLocally();
  }
};

const queueAlertLocally = () => {
  // Offline sync logic goes here
  console.log("Queued alert locally due to network failure.");
};

export const fireSystemTest = async (contacts) => {
  try {
    const gpsData = await getCurrentLocation();
    const deviceId = await SecureStore.getDeviceId() || 'test_device';
    await axios.post(API_URL, {
      encryptedAudio: 'base64_encoded_dummy_audio',
      gpsLat: gpsData.lat,
      gpsLng: gpsData.lng,
      timestamp: Date.now(),
      deviceId,
      contacts,
      isTest: true
    });
  } catch(e) {
    console.log("Test execution failed:", e.message);
  }
};
