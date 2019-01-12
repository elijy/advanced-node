const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

// Set up redis
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get); // Change this to use promises instead of callbacks

// Save a reference to the original exec function
const exec = mongoose.Query.prototype.exec;

// Build a chainable function that we can add to any query call if we want to use caching or not
mongoose.Query.prototype.cache = function () {
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
  const cacheValue = await client.get(key);

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
  client.set(key, JSON.stringify(result), 'EX', 10);

  return result;
}
