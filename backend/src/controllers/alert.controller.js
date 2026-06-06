const EmailService = require('../services/email.service');
const { getIo } = require('../services/socket.service');
const Alert = require('../models/Alert.model');
const NGO = require('../models/NGO.model');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);

const convertToWav = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('pcm_s16le')
      .audioChannels(1)
      .audioFrequency(16000)
      .format('wav')
      .on('end', () => {
        console.log("✅ WAV created:", outputPath);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.log("❌ FFmpeg error:", err.message);
        reject(err);
      })
      .save(outputPath);
  });
};

exports.handleEmergencyAlert = async (req, res) => {
  let wavPath = null;
  let audioPath = null;

  try {
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: "Audio file required" });
    }

    audioPath = audioFile.path;

    const gpsLat = parseFloat(req.body.gpsLat) || 0;
    const gpsLng = parseFloat(req.body.gpsLng) || 0;
    const timestamp = req.body.timestamp;
    const deviceId = req.body.deviceId || 'unknown';
    const isTest = req.body.isTest === 'true';

    // ✅ Parse contacts carefully
    let contacts = [];
    try {
      const raw = req.body.contacts;
      console.log("📋 Raw contacts received:", raw);
      contacts = JSON.parse(raw || "[]");
      console.log("📋 Parsed contacts:", contacts);
    } catch (e) {
      console.log("❌ Failed to parse contacts:", e.message);
      contacts = [];
    }

    // Filter valid emails
    const validEmails = contacts.filter(e => e && /\S+@\S+\.\S+/.test(e));
    console.log("📧 Valid emails to notify:", validEmails);

    if (validEmails.length === 0) {
      console.log("⚠️ No valid email contacts found — check app settings");
    }

    // Verify Gmail connection on first alert
    await EmailService.verifyConnection();

    // Convert to WAV
    wavPath = audioPath + ".wav";
    await convertToWav(audioPath, wavPath);

    // Find nearest NGO
    let nearestNgo = null;
    try {
      if (gpsLat && gpsLng) {
        nearestNgo = await NGO.findOne({
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [gpsLng, gpsLat] },
              $maxDistance: 50000
            }
          }
        });
      }
    } catch (ngoErr) {
      console.log("⚠️ NGO search failed (non-critical):", ngoErr.message);
    }

    // ML call — skip for test alerts
    let danger = isTest ? true : true;

    if (!isTest) {
      try {
        const formData = new FormData();
        formData.append('audio', fs.createReadStream(wavPath), {
          filename: 'audio.wav',
          contentType: 'audio/wav'
        });

        const mlResponse = await axios.post(
          "http://192.168.1.87:8000/predict",  // your ML server
          formData,
          { headers: formData.getHeaders(), timeout: 10000 }
        );

        console.log("🧠 ML RESPONSE:", mlResponse.data);
        danger = mlResponse.data?.danger ?? true;

      } catch (mlErr) {
        console.log("⚠️ ML ERROR (defaulting danger=true):", mlErr.message);
        danger = true;
      }
    }

    // Safe — stop
    if (!danger) {
      console.log("✅ SAFE → No alert sent");
      fs.unlink(audioPath, () => {});
      fs.unlink(wavPath, () => {});
      return res.status(200).json({ message: "Safe" });
    }

    console.log("🚨 DANGER DETECTED — sending alerts to:", validEmails);

    // Build message
    const googleMapsLink = `https://maps.google.com/?q=${gpsLat},${gpsLng}`;
    const message = `🚨 EMERGENCY ALERT 🚨

Someone needs help!

📍 Location: ${googleMapsLink}

⚠️ AI detected potential danger in the audio recording.
${isTest ? '\n[THIS IS A TEST ALERT]' : ''}

Please respond immediately!`;

    // Send emails — wait for ALL to finish before deleting audio
    if (validEmails.length > 0) {
      console.log(`📧 Sending ${validEmails.length} email(s)...`);

      const emailResults = await Promise.allSettled(
        validEmails.map(email =>
          EmailService.sendEmail(email, "🚨 SOS ALERT", message, wavPath)
        )
      );

      emailResults.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          console.log(`✅ Email ${i + 1} sent to ${validEmails[i]}`);
        } else {
          console.log(`❌ Email ${i + 1} failed to ${validEmails[i]}:`, result.reason?.message);
        }
      });
    }

    // Socket update
    try {
      const io = getIo();
      io.to(deviceId).emit('location_update', {
        lat: gpsLat, lng: gpsLng, timestamp, alertId: deviceId
      });
    } catch (socketErr) {
      console.log("⚠️ Socket error (non-critical):", socketErr.message);
    }

    // Save to DB
    try {
      const alertLog = new Alert({
        deviceId,
        location: { type: 'Point', coordinates: [gpsLng, gpsLat] },
        deviceTimestamp: timestamp,
        s3AudioUrl: audioPath,
        nearestNgoNotified: nearestNgo ? nearestNgo._id : null,
        contactsNotified: validEmails,
        status: 'sent'
      });
      await alertLog.save();
      console.log("💾 Alert saved to DB");
    } catch (dbErr) {
      console.log("⚠️ DB save failed (non-critical):", dbErr.message);
    }

    // Safe to delete files now — emails already sent
    fs.unlink(audioPath, () => console.log("🗑️ Audio deleted"));
    fs.unlink(wavPath, () => console.log("🗑️ WAV deleted"));

    return res.status(200).json({ success: true, notified: validEmails.length });

  } catch (error) {
    console.error("❌ ALERT ERROR:", error);
    if (audioPath) fs.unlink(audioPath, () => {});
    if (wavPath) fs.unlink(wavPath, () => {});
    return res.status(500).json({ success: false, error: error.message });
  }
};