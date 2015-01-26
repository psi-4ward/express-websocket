var merge = require('lodash.merge');
var Primus = require('primus');
var PrimusResponder = require('primus-responder');
var VirtualRequest = require('express-virtual-request').request;
var VirtualResponse = require('express-virtual-request').response;
var debug = require('debug')('express-websocket');

module.exports = function initExpressWebsocket(expressApp, server, opts) {
  var options = merge({transformer: 'engine.io'}, opts);

  debug('Init');
  var primus = new Primus(server, options);
  primus.use('responder', PrimusResponder);

  primus.on('connection', function(spark) {
    debug('[' + spark.id + ']', 'connected from', spark.address.ip);

    spark.on('request', function(jreq, done) {

      // check if its a json-web-request
      if(typeof jreq !== 'object' || !jreq.url || jreq.type !== 'json-web-request') {
        debug('['+spark.id+']', 'request is not a json-web-request, ignoring');
        return;
      }

      jreq.method = jreq.method ? jreq.method.toUpperCase() : 'GET';
      jreq = merge({
        method: 'GET',
        url: '/',
        headers: {
          'Accept': 'application/json',
        },
        connection: {
          remoteAddress: spark.address,
          encrypted: false // TODO: is the ws connection httpS?
        },
        isWebsocket: true,
        spark: spark,
        primus: primus
      }, {headers: spark.headers}, jreq);

      var req = new VirtualRequest(jreq);
      var res = new VirtualResponse(req);
      res.on('finish', function() {
        done({
          status: res.statusMessage,
          statusCode: res.statusCode,
          headers: res.headers,
          body: res.body
        });
        debug('[' + spark.id + '] response:', res.statusCode, res.statusMessage);
      });

      if(options.beforeExpress) {
        debug('[' + spark.id + '] invoke beforeExpress hook');
        options.beforeExpress(req, res, function(err) {
          if(err) return;
          debug('[' + spark.id + '] request:', req.method, req.url);
          expressApp.handle(req, res);
        });
      } else {
        debug('[' + spark.id + '] request:', req.method, req.url);
        expressApp.handle(req, res);
      }
    });
  });

  return primus;
};