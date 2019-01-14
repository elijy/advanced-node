require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

// Just a bunch of set up for mongoose in tests.
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient: true })
