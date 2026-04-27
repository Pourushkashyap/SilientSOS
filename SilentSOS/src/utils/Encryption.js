export const encryptAudio = async (audioFilePath, deviceId) => {
  try {
    // Dummy encryption (safe for Expo Go)
    const dummyAudio = "dummy_audio_data_base64";

    return `encrypted_${deviceId}_${dummyAudio}`;
    
  } catch (err) {
    console.log("Encryption Error", err);
    return null;
  }
};