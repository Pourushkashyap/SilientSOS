const { uploadAudio } = require('../services/upload.service');
const { dispatchAlertCommunications } = require('../services/twilio.service');
const { getIo } = require('../services/socket.service');
const Alert = require('../models/Alert.model');
const NGO = require('../models/NGO.model');

exports.handleEmergencyAlert = async (req, res) => {
  try {
    const { encryptedAudio, gpsLat, gpsLng, timestamp, deviceId, contacts } = req.body;

    // 1. Upload audio to S3 (dummy implementation for now unless keys provided)
    const audioUrl = await uploadAudio(encryptedAudio, deviceId, timestamp);

    // 2. Find Nearest NGO
    let nearestNgo = null;
    if (gpsLat && gpsLng) {
      nearestNgo = await NGO.findOne({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [gpsLng, gpsLat] },
            $maxDistance: 50000 // 50km
          }
        }
      });
    }

    // 3. Dispatch SMS/WhatsApp
    const googleMapsLink = `https://maps.google.com/?q=${gpsLat},${gpsLng}`;
    await dispatchAlertCommunications(contacts, nearestNgo, googleMapsLink, audioUrl);

    // 4. Update Socket Connection
    const io = getIo();
    io.to(deviceId).emit('location_update', {
      lat: gpsLat,
      lng: gpsLng,
      timestamp,
      alertId: deviceId
    });

    // 5. Save Alert log
    const alertLog = new Alert({
      deviceId,
      location: { type: 'Point', coordinates: [gpsLng, gpsLat] },
      timestamp: timestamp,
      s3AudioUrl: audioUrl,
      nearestNgoNotified: nearestNgo ? nearestNgo._id : null,
      contactsNotified: contacts
    });
    await alertLog.save();

    return res.status(200).json({ success: true, alertId: alertLog._id });
  } catch (error) {
    console.error("Alert Handling Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error during dispatch" });
  }
};
