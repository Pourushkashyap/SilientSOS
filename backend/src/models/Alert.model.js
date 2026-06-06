const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  // FIX Bug 5: renamed to deviceTimestamp to avoid clash with mongoose timestamps option
  deviceTimestamp: {
    type: String,
    default: null
  },
  s3AudioUrl: {
    type: String,
    default: null
  },
  nearestNgoNotified: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    default: null
  },
  contactsNotified: {
    type: [String],
    validate: {
      validator: function (emails) {
        return emails.every(email => /\S+@\S+\.\S+/.test(email));
      },
      message: "Invalid email format"
    }
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

AlertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Alert', AlertSchema);