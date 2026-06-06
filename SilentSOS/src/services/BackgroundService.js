import { Platform } from 'react-native';  // ✅ FIXED — was missing
import AudioCapture from './AudioCapture';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

let isRunning = false;
let timeoutRef = null;

const runListeningCycle = async () => {
  if (!isRunning) return;

  try {
    await AudioCapture.init();
    const audioUri = await AudioCapture.recordDuration(2000);

    if (!audioUri) {
      scheduleNext();
      return;
    }

    // ✅ Add 500ms wait after recording to ensure file is fully written to disk
    await new Promise(r => setTimeout(r, 500));

    const isAndroid = Platform.OS === 'android';
    const mimeType = isAndroid ? 'audio/m4a' : 'audio/wav';
    const fileName = isAndroid ? 'audio.m4a' : 'audio.wav';

    const formData = new FormData();
    formData.append("audio", {
      uri: audioUri,
      name: fileName,
      type: mimeType
    });

    const res = await axios.post(API_CONFIG.ML_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 8000
    });

    console.log("🧠 ML:", res.data);

    if (res.data.danger) {
      console.log("🚨 DANGER DETECTED");
      const { dispatchAlert } = require('./AlertDispatcher');
      await dispatchAlert();
      isRunning = false;
      return;
    }

  } catch (err) {
    console.log("❌ Listening error:", err.message);
  }

  scheduleNext();
};

const scheduleNext = () => {
  if (!isRunning) return;
  timeoutRef = setTimeout(runListeningCycle, 5000);
};

export const startListening = async () => {
  if (isRunning) return;
  isRunning = true;
  console.log("🎧 Background listening started");
  runListeningCycle();
};

export const stopListening = () => {
  isRunning = false;
  if (timeoutRef) {
    clearTimeout(timeoutRef);
    timeoutRef = null;
  }
  console.log("🛑 Listening stopped");
};