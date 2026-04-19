const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  timestamp: {
    type: Number,
    required: true
  },
  s3AudioUrl: {
    type: String
  },
  nearestNgoNotified: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO'
  },
  contactsNotified: {
    type: [String]
  }
}, { timestamps: true });

AlertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Alert', AlertSchema);
