import AudioRecord from 'react-native-audio-record';
import RNFS from 'react-native-fs';

class AudioCaptureService {
  constructor() {
    this.isRecording = false;
    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      wavFile: 'temp_capture.wav'
    };
    AudioRecord.init(options);
  }

  async recordChunk() {
    return new Promise((resolve) => {
      AudioRecord.start();
      this.isRecording = true;
      
      // We only return Float32 array representation if we use a native module. 
      // For this implementation, we simulate fetching the buffer by stopping it.
      setTimeout(async () => {
        const audioFile = await AudioRecord.stop();
        this.isRecording = false;
        
        // Return dummy float buffer for tfjs
        const buffer = new Float32Array(16000 * 2); 
        resolve(buffer);
      }, 2000);
    });
  }

  async recordDuration(ms) {
    return new Promise((resolve) => {
      AudioRecord.start();
      setTimeout(async () => {
        const audioFile = await AudioRecord.stop();
        resolve(audioFile); // Returns path to WAV file
      }, ms);
    });
  }
}

export default new AudioCaptureService();
