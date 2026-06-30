const mongoose = require('mongoose');

const EfirArchiveSchema = new mongoose.Schema({
  efirId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  incidentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  travelerId: {
    type: String,
    required: true
  },
  victimIdentity: {
    name: String,
    kycType: String,
    kycId: String,
    bloodType: String,
    allergies: [String],
    emergencyContacts: mongoose.Schema.Types.Mixed
  },
  incidentDetails: {
    eventType: String,
    gps: {
      lat: Number,
      lng: Number
    },
    timestamp: Date,
    reconstructionError: Number
  },
  dispatchStatus: {
    police: {
      endpoint: String,
      status: { type: String, enum: ['SENT', 'ACKNOWLEDGED', 'FAILED'], default: 'SENT' },
      dispatchedAt: { type: Date, default: Date.now }
    },
    hospital: {
      endpoint: String,
      status: { type: String, enum: ['SENT', 'ACKNOWLEDGED', 'FAILED'], default: 'SENT' },
      dispatchedAt: { type: Date, default: Date.now }
    }
  },
  pdfUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EfirArchive', EfirArchiveSchema);
