// Setup basic express server
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const util = require('util');

const io = require('socket.io')(server);
const channels = {};

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

// Routing
app.use(express.static('public'));

app.use(function (req, res, next) {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', function (chunk) {
    data += chunk;
  });
  req.on('end', function () {
    req.body = data;
    next();
  });
});

app.all(/\/handler\/([^/]*)(\/?.*)/, function (req, res) {
  let channel = req.params[0];
  let data = {
    method: req.method,
    version: req.httpVersion,
    ip: req.ip,
    ips: req.ips,
    path: req.params[1],
    host: req.hostname,
    query: req.query,
    body: req.body,
    headers: req.headers
  };
  if (channels[channel]) {
    channels[channel].forEach(function (socket) {
      socket.emit('channel_data', channel, data);
    });
    res.send('OK');
  } else {
    res.send('NOLISTENERS');
  }
});

io.on('connection', function (socket) {
  (function () {
    let oldEmit = socket.emit;
    socket.emit = function () {
      console.log(
        util.format('[%s] Socket.emit: %s', this.id, util.inspect(arguments))
      );
      oldEmit.apply(this, arguments);
    };
  })();

  socket.channels = [];
  console.log('new user:', socket.id);

  socket.emit('request_channels');

  socket.on('listen_channel', function (channel) {
    console.log('[' + socket.id + '] Listening for channel: ' + channel);
    socket.channels = [...new Set(socket.channels.concat(channel))];

    if (!channels[channel]) {
      channels[channel] = [];
    }
    channels[channel].push(socket);
    channels[channel] = [...new Set(channels[channel])];
  });

  socket.on('disconnect', function () {
    socket.channels.forEach(function (channel) {
      let position = channels[channel].indexOf(socket);
      channels[channel].splice(position, 1);

      if (channels[channel].length === 0) {
        delete channels[channel];
      }
    });
    console.log('disconnect');
  });
});

module.exports = server;
server.app = app;
