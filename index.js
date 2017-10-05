const app = require('./lib/server');

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Node app is running on port', port);
});
