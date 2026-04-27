import axios from 'axios';
import { getCurrentLocation } from './GPSService';
import SecureStore from '../storage/SecureStore';
import AudioCapture from './AudioCapture';

// ✅ PC IP
const API_URL = "http://10.62.128.34:5000/api/alert";

// 🔥 LOCK
let isSending = false;

export const dispatchAlert = async () => {
  if (isSending) {
    console.log("🚫 Already sending alert...");
    return;
  }

  isSending = true;

  try {
    console.log("🔥 ALERT TRIGGERED");

    // 🎤 RECORD AUDIO
    const audioUri = await AudioCapture.recordDuration(3000);

    if (!audioUri) {
      console.log("❌ No audio recorded");
      return;
    }

    // 📱 Device ID
    let deviceId = await SecureStore.getDeviceId?.();
    if (!deviceId) deviceId = "unknown_device";

    // 📍 GPS
    const gpsData = await getCurrentLocation();
    const lat = gpsData?.lat || 0;
    const lng = gpsData?.lng || 0;

    // 📧 Contacts
    const settings = await SecureStore.getSettings?.();
    const contacts = settings?.contacts || [];

    // 📦 FORM DATA (IMPORTANT 🔥)
    const formData = new FormData();

    formData.append("audio", {
      uri: audioUri,
      name: "audio.wav",
      type: "audio/wav", // ❗ error aaye to "audio/m4a"
    });

    formData.append("gpsLat", lat);
    formData.append("gpsLng", lng);
    formData.append("timestamp", Date.now());
    formData.append("deviceId", deviceId);
    formData.append("contacts", JSON.stringify(contacts));

    // 🚀 SEND
    await axios.post(API_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Alert sent successfully");

  } catch (err) {
    console.log("❌ Alert failed:", err.message);
  } finally {
    setTimeout(() => {
      isSending = false;
    }, 5000);
  }
};


// 🧪 TEST FUNCTION (NO AUDIO)
let isTesting = false;

export const fireSystemTest = async (contacts = []) => {
  if (isTesting) {
    console.log("🚫 Test already running...");
    return;
  }

  isTesting = true;

  try {
    console.log("🧪 TEST ALERT");

    const gpsData = await getCurrentLocation();

    let deviceId = await SecureStore.getDeviceId?.();
    if (!deviceId) deviceId = "test_device";

    await axios.post(API_URL, {
      encryptedAudio: "dummy",
      gpsLat: gpsData?.lat || 0,
      gpsLng: gpsData?.lng || 0,
      timestamp: Date.now(),
      deviceId,
      contacts,
      isTest: true
    });

    console.log("✅ Test alert sent");

  } catch (e) {
    console.log("❌ Test failed:", e.message);
  } finally {
    setTimeout(() => {
      isTesting = false;
    }, 5000);
  }
};