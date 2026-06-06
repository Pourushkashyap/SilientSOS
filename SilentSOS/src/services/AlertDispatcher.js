import axios from 'axios';
import { Platform } from 'react-native';
import { getCurrentLocation } from './GPSService';
import SecureStore from '../storage/SecureStore';
import AudioCapture from './AudioCapture';
import { API_CONFIG } from '../config/api';

const API_URL = `${API_CONFIG.BASE_URL}/api/alert`;

export const dispatchAlert = async () => {
  try {
    console.log("🔥 ALERT TRIGGERED");

    // FIX Bug 2: init audio first
    await AudioCapture.init();
    const audioUri = await AudioCapture.recordDuration(3000);

    if (!audioUri) {
      console.log("❌ No audio recorded");
      return;
    }

    const gpsData = await getCurrentLocation();
    const lat = gpsData?.lat || 0;
    const lng = gpsData?.lng || 0;

    let deviceId = await SecureStore.getDeviceId?.();
    if (!deviceId) deviceId = "unknown_device";

    const settings = await SecureStore.getSettings?.();
    const contacts = settings?.contacts || [];

    // FIX Bug 4: detect correct MIME type per platform
    const isAndroid = Platform.OS === 'android';
    const mimeType = isAndroid ? 'audio/m4a' : 'audio/wav';
    const fileName = isAndroid ? 'audio.m4a' : 'audio.wav';

    const formData = new FormData();
    formData.append("audio", {
      uri: audioUri,
      name: fileName,
      type: mimeType
    });

    formData.append("gpsLat", String(lat));
    formData.append("gpsLng", String(lng));
    formData.append("timestamp", String(Date.now()));
    formData.append("deviceId", deviceId);
    formData.append("contacts", JSON.stringify(contacts));

    await axios.post(API_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 15000
    });

    console.log("✅ Alert sent successfully");

  } catch (err) {
    console.log("❌ Alert failed:", err.message);
  }
};

// FIX Bug 7: export fireSystemTest so HiddenSetupScreen can import it
export const fireSystemTest = async (validEmails) => {
  try {
    console.log("🧪 Firing test alert to:", validEmails);

    const gpsData = await getCurrentLocation();

    const formData = new FormData();

    // Attach a tiny silent WAV (1 second of silence) for testing
    // In a real test you'd record a short clip — for now send a dummy
    formData.append("gpsLat", String(gpsData?.lat || 0));
    formData.append("gpsLng", String(gpsData?.lng || 0));
    formData.append("timestamp", String(Date.now()));
    formData.append("deviceId", "TEST_DEVICE");
    formData.append("contacts", JSON.stringify(validEmails));
    formData.append("isTest", "true");

    await axios.post(API_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 15000
    });

    console.log("✅ Test alert sent");
  } catch (err) {
    console.log("❌ Test alert failed:", err.message);
  }
};