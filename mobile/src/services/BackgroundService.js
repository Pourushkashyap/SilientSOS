import BackgroundActions from 'react-native-background-actions';
import AudioCapture from './AudioCapture';
import { extractFeatures } from '../utils/AudioFeatures';
import { runStressInference, runKeywordInference } from './MLInference';
import { calculateThreatScore } from './ThreatScorer';
import { dispatchAlert } from './AlertDispatcher';
import { getCurrentLocation } from './GPSService';

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const bgOptions = {
  taskName: 'SyncService',
  taskTitle: 'Sync Service',
  taskDesc: 'Keeps your app data synchronized',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ffffff',
  linkingURI: 'silentsos://chat/jane', // deep link
  parameters: {
    delay: 2000,
  },
};

class BackgroundServiceManager {
  constructor() {
    this.threatTimerStarted = null;
    this.isRunning = false;
  }

  async backgroundTask(taskDataArguments) {
    const { delay } = taskDataArguments;
    
    while (BackgroundActions.isRunning()) {
      try {
        // 1. Capture 2s Audio
        const audioData = await AudioCapture.recordChunk();
        
        // 2. Extract Features
        const features = extractFeatures(audioData);
        
        // 3. ML Inference
        const stressResult = await runStressInference(features.mfcc);
        const keywordResult = await runKeywordInference(features.melSpectrogram);
        
        // 4. GPS & Threat Scorer
        const gpsData = await getCurrentLocation();
        const { score, reasons } = calculateThreatScore(stressResult, keywordResult, gpsData, {});
        
        // 5 & 6. Threat timer logic
        if (score >= 4) {
          if (!this.threatTimerStarted) {
            this.threatTimerStarted = Date.now();
          } else {
            const timeElapsed = Date.now() - this.threatTimerStarted;
            if (timeElapsed >= 8000) {
              await dispatchAlert();
              this.threatTimerStarted = null; // reset logic
            }
          }
        } else {
          this.threatTimerStarted = null;
        }

        await sleep(delay);
      } catch (err) {
        console.log("Background Service Error: ", err);
        // Do not crash, keep looping
        await sleep(delay);
      }
    }
  }

  async start() {
    if (this.isRunning) return;
    try {
      await BackgroundActions.start(this.backgroundTask.bind(this), bgOptions);
      this.isRunning = true;
    } catch (e) {
      console.log('Error starting BG actions', e);
    }
  }

  async stop() {
    await BackgroundActions.stop();
    this.isRunning = false;
  }
}

export default new BackgroundServiceManager();
