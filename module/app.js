'use strict';

var config = require('../config');
var riak = require('./riak');

var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

var Q = require('q');
var logger = require('winston');

function parseParams(request) {
  var result = {};
  var query = url.parse(request.url, true).query;
  if (query) {
    result.tsPath = query.tsPath;
    result.m3u8Path = query.m3u8Path;
    result.bucket = query.bucket;
  }
  logger.info('params is: ', result);
  return result;
}

function getFileContent(filePath) {
  var deferred = Q.defer();
  var startTime = new Date().getTime();
  fs.readFile(filePath, function(e, c) {
    if (e) {
      deferred.reject(new Error(e));
    } else {
      var endTime = new Date().getTime();
      logger.info('read file successful, with time %dms', endTime - startTime);
      deferred.resolve(c);
    }
  });
  return deferred.promise;
}

module.exports = {
  listen: function() {
    var server = http.createServer(function(request, response) {
      var params = parseParams(request);
      if (params.tsPath && params.bucket) {
        getFileContent(params.tsPath).then(function(fileContent) {
          var paths = params.tsPath.split(path.sep);
          var key = paths[paths.length - 1];
          riak.storeRiak(params.bucket, key, fileContent);
        }).catch(function(e) {
          logger.error(e);
        });
      }
      if (params.m3u8Path && params.bucket) {
        getFileContent(params.m3u8Path).then(function(fileContent) {
          var paths = params.m3u8Path.split(path.sep);
          var key = paths[paths.length - 1];
          riak.storeRiak(params.bucket, key, fileContent);
        }).catch(function(e) {
          logger.error(e);
        });
      }

      response.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      response.end('done');
    });

    server.listen(config.httpConfig.port);
  }
}
