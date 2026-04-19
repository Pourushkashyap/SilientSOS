# SilentSOS

SilentSOS is a comprehensive domestic violence safety application disguised as a normal calculator. It continuously runs a stealth background service to analyze ambient audio on-device using machine learning, instantly dispatching SOS alerts to pre-configured contacts and NGOs when distress is detected.

## Features
- **Stealth UI**: Fully functional calculator app.
- **Background Persistence**: Android foreground service capturing audio 24/7 without draining battery heavily.
- **On-Device Inference**: TensorFlow.js running directly on the mobile device. No audio leaves the phone unless an alert is fired.
- **BiLSTM Stress Classifier**: Detects angry or fearful vocal patterns.
- **CNN Keyword Spotter**: Detects words like 'stop', 'help', 'no'.
- **Threat Fusion Scoring**: Combines ML results, GPS accuracy, and context to minimize false positives.
- **Web Dashboard**: Live socket tracking for emergency contacts using Leaflet maps.

## Project Structure
- `mobile/` - React Native application.
- `backend/` - Node.js + Express backend.
- `ml/` - Python ML training pipeline.
- `dashboard/` - React Vite Web Dashboard.

## Setup Instructions

### 1. Backend Server
```bash
cd backend
npm install
# Copy .env.example to .env and configure keys
npm run start
```

### 2. ML Pipeline
```bash
cd ml
pip install -r requirements.txt
# Download RAVDESS & CREMA-D into data/
python preprocess.py
python train_stress_model.py
python train_keyword_model.py
python export_to_tfjs.py
# Models are exported directly to mobile/src/models/
```

### 3. Mobile App
```bash
cd mobile
npm install
# Ensure you are on Android SDK or connect an emulator
npx react-native run-android
```

### 4. Web Dashboard
```bash
cd dashboard
npm install
npm run dev
```

*Note: Due to the complexity of the sensor APIs, some parts of this system (like BackgroundServices and hardware VAD) need a physical device for accurate testing.*
