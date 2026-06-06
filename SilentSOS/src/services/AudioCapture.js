import { Audio } from 'expo-av';

class AudioCaptureService {

  async init() {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        throw new Error("Microphone permission not granted");
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      console.log("✅ Audio system ready");

    } catch (err) {
      console.log("❌ Audio init error:", err.message);
    }
  }

  async recordDuration(ms = 3000) {
    try {
      console.log("🎤 Recording started");

      const recording = new Audio.Recording();

      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      await recording.startAsync();

      // ⏱️ wait for duration
      await new Promise(resolve => setTimeout(resolve, ms));

      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();

      console.log("🎧 Recording saved:", uri);

      return uri;

    } catch (error) {
      console.log("❌ Recording error:", error.message);
      return null;
    }
  }
}

export default new AudioCaptureService();