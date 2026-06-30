const mongoose = require('mongoose');

const TelemetryArchiveSchema = new mongoose.Schema({
  travelerId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
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
  accelerometerData: {
    amags: { type: [Number], required: true }, // 150 magnitude points
    maxVal: { type: Number },
    meanVal: { type: Number }
  }
});

// Create geospatial index for location queries
TelemetryArchiveSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('TelemetryArchive', TelemetryArchiveSchema);
