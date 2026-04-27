import AudioCapture from './AudioCapture';
import axios from 'axios';

const ML_URL = "http://10.62.128.34:8000/predict";

let isRunning = false;

export const startListening = async () => {
  if (isRunning) return;

  isRunning = true;
  console.log("🎧 Background listening started");

  while (isRunning) {
    try {
      const audioUri = await AudioCapture.recordDuration(2000);

      const formData = new FormData();
      formData.append("audio", {
        uri: audioUri,
        name: "audio.wav",
        type: "audio/wav"
      });

      const res = await axios.post(ML_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      console.log("🧠 ML:", res.data);

      if (res.data.danger) {
        console.log("🚨 DANGER DETECTED");

        // 🔥 trigger alert
        const { dispatchAlert } = require('./AlertDispatcher');
        await dispatchAlert();

        break;
      }

    } catch (err) {
      console.log("❌ Listening error:", err.message);
    }

    // ⏱️ wait 5 sec
    await new Promise(r => setTimeout(r, 5000));
  }
};

export const stopListening = () => {
  isRunning = false;
};