$(function() {
  var socket = io();
  socket.on('request_channels', function() {
    console.log('requesting channels');
    socket.emit('listen_channel', 'eti/gavin');
  });
  socket.on('channel_data', function(channel, reply) {
    console.log("channel data", arguments);
  });
});
