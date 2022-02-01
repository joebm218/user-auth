const mongoose = require('mongoose');

const imgSchema = new mongoose.Schema({
  country_name: String,
  rate: String,
  imga: String,
  imgb: String,
  imgc: String,
  content: String
}, { timestamps: true });
module.exports = mongoose.model('Images', imgSchema);
