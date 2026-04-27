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
      type: [Number], // [lng, lat]
      required: true
    }
  },

  // ❌ remove manual timestamp (mongoose already adds createdAt)
  
  s3AudioUrl: {
    type: String,
    default: null
  },

  nearestNgoNotified: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    default: null
  },

  // ✅ renamed for clarity (email system)
  contactsNotified: {
    type: [String], // emails
    validate: {
      validator: function (emails) {
        return emails.every(email => /\S+@\S+\.\S+/.test(email));
      },
      message: "Invalid email format"
    }
  },

  // 🔥 NEW (VERY IMPORTANT)
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  }

}, {
  timestamps: true // adds createdAt & updatedAt
});

// 🔥 GEO INDEX (important for NGO search)
AlertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Alert', AlertSchema);