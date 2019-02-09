const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys.js');

// Set up redis
const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget); // Change this to use promises instead of callbacks

// Save a reference to the original exec function
const exec = mongoose.Query.prototype.exec;

// Build a chainable function that we can add to any query call if we want to use caching or not
mongoose.Query.prototype.cache = function (options = {}) {
  this.hashKey = JSON.stringify(options.key || '') // This is to be used be nested hashes, so if you want to cache something, you need to say what top level key you want to hash it on, we use stringify to make sure its a string no matter what they pass in
  this.useCache = true; // this is attached to the Query object so we can reference in the exec function
  return this; // CHAINABLE
}

// Now overwrite the mongoose based in exec function
mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  // Generate the key for redis, its based off the query itself and the collection we're querying
  const key = JSON.stringify(Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name }));

  // Check redis first
  const cacheValue = await client.hget(this.hashKey, key);

  // It was in the cache
  if (cacheValue) {
    console.log('Found in cache')

    const doc = JSON.parse(cacheValue)

    // Problem is sometimes doc is an array, sometimes it not so we gotta handle both cases
    return Array.isArray(doc)
    ? doc.map(d => new this.model(d))
    : new this.model(doc); // this.model is how we say make this object a mongoose collection
  }

  // It wasnt in cache so call mongo db
  console.log('not in the cache')
  const result = await exec.apply(this, arguments);

  // Store the result in the cache
  client.hset(this.hashKey, key, JSON.stringify(result));
  client.expire(this.hashKey, 10)

  return result;
}

module.exports = {
  // A function to clear our nested hash keys
  clearHash: function (hashKey) {
    client.del(JSON.stringify(hashKey))
  }
}
