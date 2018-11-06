/* eslint-env jest */
const app = require('../lib/server.js');
const req = require('supertest')(app);
const io = require('socket.io-client');

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('index', function () {
  let client;
  let mocks;
  let server;
  beforeAll(done => {
    server = app.listen(0, done);
  });
  afterAll(done => {
    server.close(done);
  });
  beforeEach(async done => {
    // connect two io clients
    client = io(`http://localhost:${server.address().port}/`);
    mocks = {
      onConnect: jest.fn(),
      onDisconnect: jest.fn(),
      onEvent: jest.fn()
    };
    client.on('error', console.log);
    client.on('connect', done);
    client.on('event', mocks.onEvent);
    client.on('disconnect', mocks.onDisconnect);
  });
  afterEach(done => {
    // disconnect io clients after each test
    client.disconnect();
    done();
  });

  it('NOLISTENERS', (done) => {
    client.on('request_channels', async function () {
      await sleep(10);
      const res = await req.post('/handler/gavintest', {
        hi: 'There'
      });
      expect(res.status).toEqual(200);
      expect(res.text).toEqual('NOLISTENERS');
      done();
    });
  });

  it('A Listener', (done) => {
    client.on('request_channels', async function () {
      client.emit('listen_channel', 'gavintest');
      await sleep(10);
      const res = await req.post('/handler/gavintest', {
        hi: 'There'
      });
      expect(res.status).toEqual(200);
      expect(res.text).toEqual('OK');
      done();
    });
  });
});
