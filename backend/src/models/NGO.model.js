const mongoose = require('mongoose');

const NGOSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  whatsapp: { type: String },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [lng, lat]
  },
  city: { type: String },
  state: { type: String },
  specialization: { type: [String] } 
});

NGOSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('NGO', NGOSchema);
