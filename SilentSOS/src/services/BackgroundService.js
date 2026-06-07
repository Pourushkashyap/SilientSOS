import { Platform } from 'react-native';
import AudioCapture from './AudioCapture';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

let isRunning = false;
let timeoutRef = null;
let isFirstCycle = true; // track first run

const sendToML = async (audioUri) => {
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
    timeout: 10000
  });

  return res.data;
};

const runListeningCycle = async () => {
  if (!isRunning) return;

  try {
    await AudioCapture.init();
    const audioUri = await AudioCapture.recordDuration(2000);

    if (!audioUri) {
      console.log("⚠️ No audio URI, skipping");
      scheduleNext();
      return;
    }

    // ✅ FIX: wait for file to fully write to disk
    // First cycle needs more time, subsequent cycles need less
    const waitTime = isFirstCycle ? 1500 : 500;
    await new Promise(r => setTimeout(r, waitTime));
    isFirstCycle = false;

    let mlData = null;

    // ✅ FIX: retry once if first attempt fails (Network Error)
    try {
      mlData = await sendToML(audioUri);
    } catch (firstErr) {
      console.log("⚠️ First attempt failed, retrying in 1s...", firstErr.message);
      await new Promise(r => setTimeout(r, 1000));
      try {
        mlData = await sendToML(audioUri);
      } catch (secondErr) {
        console.log("❌ Listening error:", secondErr.message);
        scheduleNext();
        return;
      }
    }

    console.log("🧠 ML:", mlData);

    if (mlData?.danger) {
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
  isFirstCycle = true; // reset on each fresh start
  console.log("🎧 Background listening started");
  runListeningCycle();
};

export const stopListening = () => {
  isRunning = false;
  isFirstCycle = true;
  if (timeoutRef) {
    clearTimeout(timeoutRef);
    timeoutRef = null;
  }
  console.log("🛑 Listening stopped");
};