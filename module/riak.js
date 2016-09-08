'use strict';

var config = require('../config');

var Q = require('q');
var logger = require('winston');

function createClient() {
  var deferred = Q.defer();
  config.createClient(function(e, c) {
    if (e) {
      deferred.reject(new Error(e));
    } else {
      deferred.resolve(c);
    }
  });
  return deferred.promise;
}

function stopClient(riakClient) {
  var deferred = Q.defer();
  riakClient.stop(function(e) {
    if (e) {
      deferred.rejec(new Error(e));
    } else {
      deferred.resolve();
    }
  });
  return deferred.promise;
}

function ping(riakClient) {
  var deferred = Q.defer();
  riakClient.ping(function(e, r) {
    if (e) {
      deferred.reject(new Error(e));
    } else {
      deferred.resolve(riakClient);
    }
  });
  return deferred.promise;
}

function store(riakClient, bucketType, bucket, key, value) {
  var deferred = Q.defer();
  riakClient.storeValue({
    bucket: bucket,
    key: key,
    value: value
  }, function(e, r) {
    if (e) {
      deferred.reject(new Error(e));
    } else {
      deferred.resolve({
        result: r,
        riakClient: riakClient
      });
    }
  });
  return deferred.promise;
}
;

module.exports = {
  pingRiak: function() {
    var startTime = new Date().getTime();
    createClient().then(ping).then(stopClient).then(function() {
      var endTime = new Date().getTime();
      logger.info('ping successful, with time %dms', endTime - startTime);
    }).catch(function(e) {
      logger.error(e);
    });
  },
  storeRiak: function(bucket, key, value) {
    var startTime = new Date().getTime();
    createClient().then(function(client) {
      return store(client, null, bucket, key, value);
    }).then(function(result) {
      return stopClient(result.riakClient);
    }).then(function() {
      var endTime = new Date().getTime();
      logger.info('store successful, with time %dms', endTime - startTime);
    }).catch(function(e) {
      logger.error(e);
    });
  }
};
