const mongoose = require('mongoose');

const IncidentLogSchema = new mongoose.Schema({
  incidentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  travelerId: {
    type: String,
    required: true,
    index: true
  },
  eventType: {
    type: String,
    enum: ['CRASH', 'IMMOBILITY', 'MANUAL_SOS', 'GEOFENCE_BREACH'],
    required: true
  },
  reconstructionError: {
    type: Number,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'RESOLVED'],
    default: 'ACTIVE'
  },
  notes: {
    type: String
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  }
});

IncidentLogSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('IncidentLog', IncidentLogSchema);
