import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

const BASE_PATH = '../models';

class MLManager {
  constructor() {
    this.stressModel = null;
    this.keywordModel = null;
  }

  async loadModels() {
    try {
      const stressModelJson = require(`${BASE_PATH}/stress_model/model.json`);
      const stressModelWeights = [require(`${BASE_PATH}/stress_model/group1-shard1of1.bin`)];
      this.stressModel = await tf.loadLayersModel(bundleResourceIO(stressModelJson, stressModelWeights));

      const keywordModelJson = require(`${BASE_PATH}/keyword_model/model.json`);
      const keywordModelWeights = [require(`${BASE_PATH}/keyword_model/group1-shard1of1.bin`)];
      this.keywordModel = await tf.loadLayersModel(bundleResourceIO(keywordModelJson, keywordModelWeights));
    } catch (err) {
      console.log("ML Load err", err);
    }
  }
}

export const MLInstance = new MLManager();
MLInstance.loadModels();

export const runStressInference = async (mfccFeatures) => {
  if (!MLInstance.stressModel) return { label: 'calm', confidence: 0 };
  
  try {
    const inputTensor = tf.tensor(mfccFeatures).reshape([1, -1, 43]); // example reshape
    const prediction = MLInstance.stressModel.predict(inputTensor);
    const scores = await prediction.data();
    
    const labels = ['calm', 'sad', 'angry', 'fearful'];
    const maxIdx = scores.indexOf(Math.max(...scores));
    
    return { label: labels[maxIdx], confidence: scores[maxIdx] };
  } catch (err) {
    return { label: 'calm', confidence: 0 };
  }
};

export const runKeywordInference = async (melSpectrogram) => {
  if (!MLInstance.keywordModel) return { detected: false, keyword: '' };
  
  try {
    const inputTensor = tf.tensor(melSpectrogram).reshape([1, 128, 128, 1]); // example reshape
    const prediction = MLInstance.keywordModel.predict(inputTensor);
    const scores = await prediction.data();
    
    const labels = ['background', 'stop', 'help', 'please', 'no', 'dont', 'hurt', 'leave', 'run', 'fire', 'danger', 'save', 'police'];
    const maxIdx = scores.indexOf(Math.max(...scores));
    
    if (maxIdx > 0 && scores[maxIdx] > 0.6) {
      return { detected: true, keyword: labels[maxIdx] };
    }
    return { detected: false, keyword: '' };
  } catch (err) {
    return { detected: false, keyword: '' };
  }
};
