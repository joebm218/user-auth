const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    departure: String,
    arrival: String,
    date: String,
    time: String,
    trip_type: String,
    flightimg: String
  }, { timestamps: true });

  module.exports = mongoose.model('Flight', flightSchema);
