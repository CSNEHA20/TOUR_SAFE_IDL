const mongoose = require('mongoose');

const TravelerProfileSchema = new mongoose.Schema({
  travelerId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  kyc: {
    typeType: { type: String, enum: ['AADHAAR', 'PASSPORT'], required: true },
    documentId: { type: String, required: true }
  },
  medicalVault: {
    ipfsCID: { type: String, required: true },
    publicKeyHash: { type: String, required: true },
    encryptedData: { type: String } // Backup encrypted vault data locally
  },
  safetyStatus: {
    type: String,
    enum: ['SAFE', 'ALERT', 'EMERGENCY'],
    default: 'SAFE'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TravelerProfile', TravelerProfileSchema);
