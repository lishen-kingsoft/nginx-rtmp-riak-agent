'use strict';

var Riak = require('basho-riak-client');

var riakNodes = ['10.20.122.43:8087', '10.20.122.45:8087', '10.20.122.46:8087', '10.20.122.47:8087', '10.20.122.48:8087', '10.20.122.49:8087'];

function Config() {
}

var createClient = function(cb) {
  return new Riak.Client(riakNodes, cb);
};

module.exports = Config;
module.exports.createClient = createClient;
module.exports.riakNodes = riakNodes;
module.exports.httpConfig = {
  port: 8888,
};
