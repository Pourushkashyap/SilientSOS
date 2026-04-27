import { Audio } from 'expo-av';

class AudioCaptureService {
  async recordDuration(ms = 3000) {
    try {
      console.log("🎤 Recording started");

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      await new Promise(resolve => setTimeout(resolve, ms));

      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();

      console.log("🎧 Recording saved:", uri);

      return uri;

    } catch (error) {
      console.log("❌ Recording error:", error);
      return null;
    }
  }
}

export default new AudioCaptureService();