const NGO = require('../models/NGO.model');

exports.getNearestNGO = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Missing coordinates" });
    }

    const nearestDb = await NGO.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 100000 // within 100km
        }
      }
    }).limit(5);

    return res.status(200).json({ success: true, data: nearestDb });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
