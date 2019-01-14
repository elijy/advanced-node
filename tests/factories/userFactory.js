const mongoose = require('mongoose');
const User = mongoose.model('User'); // Call mongoose for our schema

module.exports = () => {
  return new User({}).save(); // Just create a new user on the fly
}
