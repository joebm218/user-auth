const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,

  lastName: String,

  address: String,

  city: String,

  zip: Number,
  
  country: String,
  username: String,
  password: String,
  user_img: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
