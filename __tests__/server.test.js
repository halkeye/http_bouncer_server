/* eslint-env jest */
const app = require('../lib/server.js');
const req = require('supertest')(app);
const io = require('socket.io-client');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('index', function () {
  beforeEach(async done => {
    app.listen(0);
    // connect two io clients
    this.io = io(`http://localhost:${app.address().port}/`);
    this.onConnect = jest.fn();
    this.io.on('connect', this.onConnect);
    this.onEvent = jest.fn();
    this.io.on('event', this.onEvent);
    this.onDisconnect = jest.fn();
    this.io.on('disconnect', this.onDisconnect);
    // finish beforeEach setup
    done();
  });
  afterEach(done => {
    // disconnect io clients after each test
    this.io.disconnect();
    app.close();
    done();
  });

  it('hi', async () => {
    this.io.emit('listen_channel', 'gavintest');
    await sleep(10);
    const res = await req.post('/handler/gavintest', {
      hi: 'There'
    });
    expect(res.status).toEqual(200);
    expect(res.text).toEqual('NOLISTENERS');
  });
});
