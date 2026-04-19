import * as Crypto from 'expo-crypto';
import RNFS from 'react-native-fs';

export const encryptAudio = async (audioFilePath, deviceId) => {
  try {
    // 1. Read base64
    const audioBase64 = await RNFS.readFile(audioFilePath, 'base64');
    
    // 2. Hash device ID as a salt/key for rudimentary obfuscation 
    // In production, we'd use a robust AES implementation like react-native-aes-crypto
    const hashedKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      deviceId
    );

    // Simulated Encryption (XOR or simply packaging with the salt in payload for now)
    // To strictly do AES-256 in React Native without ejecting we often need `react-native-aes-crypto`.
    const encryptedPayload = `${hashedKey}::${audioBase64.split('').reverse().join('')}`;
    
    return encryptedPayload;
  } catch (err) {
    console.error("Encryption Error", err);
    return null;
  }
};
