// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var _ = require('underscore');
var util = require('util');

var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var channels = {};

/*
var redis = {};
['default', 'blocked'].forEach(function(val) {
  var r = null;
  if (process.env.REDISTOGO_URL) {
    var rtg  = require("url").parse(process.env.REDISTOGO_URL);
    r = require("redis").createClient(rtg.port, rtg.hostname);
    r.auth(rtg.auth.split(":")[1]);
  } else {
    r = require("redis").createClient();
  }

  redis[val] = r;
});
*/

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

app.use (function(req, res, next) {
  var data='';
  req.setEncoding('utf8');
  req.on('data', function(chunk) { data += chunk; });
  req.on('end', function() { req.body = data; next(); });
});

app.all(/\/handler\/([^\/]*)(\/?.*)/, function(req,res) {
  var channel = req.params[0];
  var data = {
    method: req.method,
    version: req.httpVersion,
    ip: req.ip,
    ips: req.ips,
    path: req.params[1],
    host: req.host,
    query: req.query,
    body: req.body,
    headers: req.headers

  };
  console.log('Pushing to [', channel, JSON.stringify(data));
  if (channels[channel]) {
    channels[channel].forEach(function(socket) {
      socket.emit('channel_data', channel, JSON.stringify(data));
    });
    res.send('OK');
  } else {
    res.send('NOLISTENERS');
  }
});

io.on('connection', function (socket) {
  (function() {
    var old_emit = socket.emit;
    socket.emit = function() {
      console.log(util.format( '[%s] Socket.emit: %s', this.id, util.inspect(arguments)));
      old_emit.apply(this, arguments);
    };
  })();


  socket.channels = [];
  console.log('new user:', socket.id);

  socket.emit('request_channels');

  socket.on('listen_channel', function(channel) {
    console.log('[' + socket.id + '] Listening for channel: ' + channel);
    socket.channels = _.uniq(socket.channels.concat(channel));

    if (!channels[channel]) { channels[channel] = []; }
    channels[channel].push(socket);
    channels[channel] = _.uniq(channels[channel]);
  });

  socket.on('disconnect', function() {
    socket.channels.forEach(function(channel) {
      var position = channels[channel].indexOf(socket);
      channels[channel].splice(position,1);

      if (channels[channel].length === 0) {
        delete channels[channel];
      }
    });
    console.log('disconnect');
  });
});
