const mongoose = require('mongoose');

const GeofenceBoundariesSchema = new mongoose.Schema({
  zoneId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  dangerLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  description: {
    type: String
  },
  boundary: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true,
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]], // [[[longitude, latitude], ...]]
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

GeofenceBoundariesSchema.index({ boundary: '2dsphere' });

module.exports = mongoose.model('GeofenceBoundaries', GeofenceBoundariesSchema);
