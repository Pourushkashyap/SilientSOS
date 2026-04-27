const { uploadAudio } = require('../services/upload.service');
const EmailService = require('../services/email.service');
const { getIo } = require('../services/socket.service');
const Alert = require('../models/Alert.model');
const NGO = require('../models/NGO.model');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

exports.handleEmergencyAlert = async (req, res) => {
  try {
    // 🔥 multer se file aayegi
    const audioFile = req.file;

    const gpsLat = req.body.gpsLat;
    const gpsLng = req.body.gpsLng;
    const timestamp = req.body.timestamp;
    const deviceId = req.body.deviceId;

    // 📧 contacts parse kar
    let contacts = [];
    try {
      contacts = JSON.parse(req.body.contacts);
    } catch {
      contacts = [];
    }

    console.log("🎧 Audio received:", audioFile?.path);

    // 1️⃣ Upload audio (optional S3)
    let audioUrl = null;
    if (audioFile) {
      audioUrl = audioFile.path; // abhi local use kar
    }

    // 2️⃣ Find nearest NGO
    let nearestNgo = null;
    if (gpsLat && gpsLng) {
      nearestNgo = await NGO.findOne({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(gpsLng), parseFloat(gpsLat)] },
            $maxDistance: 50000
          }
        }
      });
    }

    // 🧠 3️⃣ CALL ML MODEL (REAL FILE SEND)
    let danger = true; // fallback

    try {
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(audioFile.path));

      const mlResponse = await axios.post(
        "http://127.0.0.1:8000/predict",
        formData,
        {
          headers: formData.getHeaders()
        }
      );

      const { confidence, danger: mlDanger } = mlResponse.data;

      console.log("🧠 ML Confidence:", confidence);
      console.log("🚨 Danger:", mlDanger);

      danger = mlDanger;

    } catch (mlErr) {
      console.log("⚠️ ML failed:", mlErr.message);
    }

    // ❌ STOP if safe
    if (!danger) {
      console.log("✅ SAFE - No alert sent");
      return res.status(200).json({ message: "Safe" });
    }

    // 4️⃣ Prepare message
    const googleMapsLink = `https://maps.google.com/?q=${gpsLat},${gpsLng}`;

    const message = `🚨 EMERGENCY ALERT 🚨

User needs help!

📍 Location:
${googleMapsLink}

🎧 Audio:
${audioUrl || "Not available"}

⚠️ AI detected potential danger!

Please respond immediately!`;

    // 5️⃣ Send EMAIL
    if (contacts.length > 0) {
      const validEmails = contacts.filter(e => /\S+@\S+\.\S+/.test(e));

      for (let email of validEmails) {
        await EmailService.sendEmail(email, "🚨 SOS ALERT", message);
        console.log("📧 Email sent:", email);
      }
    }

    // 6️⃣ Socket update
    const io = getIo();
    io.to(deviceId).emit('location_update', {
      lat: gpsLat,
      lng: gpsLng,
      timestamp,
      alertId: deviceId
    });

    // 7️⃣ Save alert
    const alertLog = new Alert({
      deviceId,
      location: { type: 'Point', coordinates: [gpsLng, gpsLat] },
      timestamp,
      s3AudioUrl: audioUrl,
      nearestNgoNotified: nearestNgo ? nearestNgo._id : null,
      contactsNotified: contacts
    });

    await alertLog.save();

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ success: false });
  }
};