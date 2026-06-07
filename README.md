# SilentSOS 🚨

A women's safety app disguised as a calculator. It silently monitors audio in the background, detects distress using an AI model, and sends SOS emails with a live GPS location and audio recording to trusted contacts.

---

## Stack

| Layer | Tech |
|-------|------|
| Mobile | React Native, Expo |
| Backend | Node.js, Express, MongoDB |
| ML Server | Python, Flask, TensorFlow |
| Email | Nodemailer + Gmail |
| Audio | FFmpeg, librosa, expo-av |

---

## Prerequisites

- Node.js v18+, Python 3.9+, MongoDB
- [FFmpeg](https://www.gyan.dev/ffmpeg/builds/) added to system PATH
- [Expo Go](https://expo.dev/go) on your phone
- Phone and PC on the **same WiFi**

---

## Setup

**1. Set your PC's local IP in `SilentSOS/src/config/api.js`**
```javascript
export const API_CONFIG = {
  BASE_URL: "http://YOUR_PC_IP:5000",
  ML_URL:   "http://YOUR_PC_IP:8000/predict",
};
```
Find your IP with `ipconfig` (Windows) → look for **IPv4 Address** under Wi-Fi.

**2. Backend — create `backend/.env`**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/silentsos
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```
> `EMAIL_PASS` must be a **Gmail App Password** — Google Account → Security → 2-Step Verification → App Passwords → Generate.

**3. Install dependencies**
```bash
cd backend && npm install
cd ml     && pip install flask tensorflow librosa numpy pydub ffmpeg-python
cd SilentSOS && npm install
```

---

## Running

Open 4 terminals and run each:

```bash
# Terminal 1 — Database
mongod

# Terminal 2 — Backend
cd backend && node server.js

# Terminal 3 — ML server
cd ml && python api.py

# Terminal 4 — Mobile app
cd SilentSOS && npx expo start
```

Scan the QR code with Expo Go on your phone.

---

## First use

1. Open the app — it looks like a calculator
2. Enter the **secret code** to reveal the hidden setup screen
3. Login with PIN (default: `1234`)
4. Add up to 3 trusted email addresses
5. Tap **Save Settings**
6. Tap **Start Smart Listening** to activate monitoring
7. Tap **Test Dummy Alert** to verify emails work

---

## How it works

```
Mic → 2s audio clip → ML model → danger? → SOS email + GPS to contacts
```

Every 5 seconds the app records a short clip and sends it to the ML server. The model extracts audio features (MFCC, pitch, energy) and runs them through a Bidirectional LSTM trained on the RAVDESS emotion dataset. If danger is detected (confidence > 0.6), an SOS email is sent with the audio recording attached and a Google Maps location link.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Network Error on first request | Handled automatically with retry — ignore it |
| Emails not sending | Use Gmail App Password, not your regular password |
| ML server 500 error | Run `ffmpeg -version` to confirm FFmpeg is in PATH |
| App can't reach backend | Check IP in `api.js` matches `ipconfig` output |
| MongoDB connection failed | Run `mongod` or whitelist your IP in Atlas |

---

## License

MIT
