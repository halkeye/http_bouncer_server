#!/usr/bin/env nodejs

// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');

var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var redis;

if (process.env.REDISTOGO_URL) {
  var rtg  = require("url").parse(process.env.REDISTOGO_URL);
  redis = require("redis").createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(":")[1]);
  // TODO: redistogo connection
} else {
  redis = require("redis").createClient();
}

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
// Routing
app.use(express.static(__dirname + '/public'));
app.use (function(req, res, next) {
  var data='';
  req.setEncoding('utf8');
  req.on('data', function(chunk) { 
    data += chunk;
  });

  req.on('end', function() {
    req.body = data;
    next();
  });
});

// Body Parser
//app.use(bodyParser.urlencoded());
//app.use(bodyParser.json());

app.post(/\/handler\/(.*)/, function(req,res) {
  var data = {
    ip: req.ip,
    ips: req.ips,
    path: req.path,
    host: req.host,
    query: req.query,
    body: req.body,
    headers: req.headers

  };
  console.log("Pushing to", req.params[0], JSON.stringify(data));
  redis.rpush(req.params[0], JSON.stringify(data), function(err, reply) {
    console.log("rpush", {err: err, reply: reply});
  });
  res.send("OK");
});

io.on('connection', function (socket) {
  socket.listen_channels = {};
  console.log('new user:', socket.id);

  socket.emit('request_channels');

  socket.on('listen_channel', function(channel) {
    console.log("[" + socket.id + "] Listening for channel: " + channel);
    socket.listen_channels[channel] = function() {
      redis.blpop(channel, 60, function(err, reply) {
        console.log("err", err);
        console.log("reply", reply);
        socket.emit('channel_data', channel, reply);

        /* Is it still listening? */
        if (socket && socket.listen_channels && socket.listen_channels[channel]) 
        {
          process.nextTick(socket.listen_channels[channel]);
        }
      });
    };
    socket.listen_channels[channel]();
  });

  socket.on('new message', function(data) {
    console.log('new message');
  });
  socket.on('disconnect', function() {
    delete socket.listen_channels;

    console.log('disconnect');
  });
});
