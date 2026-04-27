// Dummy DSP implementation (safe for Expo + ML testing)

export const extractMFCC = (audioBuffer, sampleRate = 16000) => {
  // Return dummy MFCC (40 features)
  return new Float32Array(40).fill(0.123);
};

export const extractPitch = (audioBuffer) => {
  return 120.0;
};

export const extractZCR = (audioBuffer) => {
  return 0.05;
};

export const extractEnergy = (audioBuffer) => {
  return 0.8;
};

export const extractFeatures = (audioBuffer) => {
  try {
    const mfcc = extractMFCC(audioBuffer);
    const pitch = extractPitch(audioBuffer);
    const zcr = extractZCR(audioBuffer);
    const energy = extractEnergy(audioBuffer);

    // ✅ Combine features (40 + 3 = 43)
    const combined = new Float32Array(43);
    combined.set(mfcc, 0);
    combined[40] = pitch;
    combined[41] = zcr;
    combined[42] = energy;

    // ✅ FIX: Proper 2D mel spectrogram (128x128)
    const melSpectrogram = Array.from({ length: 128 }, () =>
      new Float32Array(128).fill(0.01)
    );

    return {
      mfcc: combined,
      melSpectrogram,
    };

  } catch (err) {
    console.log("Feature extraction error:", err);

    return {
      mfcc: new Float32Array(43).fill(0),
      melSpectrogram: Array.from({ length: 128 }, () =>
        new Float32Array(128).fill(0)
      ),
    };
  }
};