# http_bouncer_server

[![Build Status](https://travis-ci.org/halkeye/http_bouncer_server.png?branch=master)](https://travis-ci.org/halkeye/http_bouncer_server)

Public service that 'rebroadcasts' http hits to any clients listening. (See: [http_bouncer_client](https://www.npmjs.org/package/http_bouncer_client))
There is no queuing or anything. Its only going to broadcasts to any clients that are connected at that time.

## Getting Started

### Own Server / Development

* `npm install http_bouncer_server`
* `node node_modules/http_bouncer_server/index.js`

### Heroku

* `heroku create`
* `heroku labs:enable websockets`
* `git push heroku master`

## Using

### Setup application to hit created server (see Getting Started)

Format should be [server]/handler/[channelname]/[regular path]

* *server* - The server running http_bouncer_server (see above)
* *channelname* - Name of the channel. This is mostly used by the client to figure out where to redirect the given http path
* *regular path* - Any additional url information to pass to the client

## Example

Setting the scene:

* You have an external service (ex github) that submits webhooks to a specified public url.
* One or more people want to develop with this data.
* Your development environment is firewalled of (ex coffeeshop)

### Sending out a sample hit

This is just demonstrating how to test out. Normally your data would come from another source.
Note the url, its sending data to the *channelname* of "gavin" and the *path* of "/handler/github?demo=1"

`curl -d '{ "zen" : "981i34epoqwdu90ads", "hook_id": 12 }' "http://localhost:3000/handler/gavin/handler/github?demo=1" --header "Content-Type:application/json"`

Note the "NOLISTENERS" response

### Setup Client to listen

We are going use the client to listen to the sample hit. We will talk to the server (-s) of `http://localhost:3000/` and map the channel `gavin` to `http://localhost/dev_application?query_string_to_merge=1`

`http_bouncer_client -s http://localhost:3000/ -c 'gavin:http://localhost/dev_application?query_string_to_merge=1'`

This will make every hit to the "gavin" channel and url of "handler/github?demo=1" to hit "http://localhost/dev_application/handler/github?demo=1&query_string_to_merge=1"
See: [http_bouncer_client](https://www.npmjs.org/package/http_bouncer_client) for more info.

## Release History

0.0.2 - 2014-07-11

* Added documentation and examples
* Updated dependancies

0.0.1 - 2014-06-17

* Initial Release

## License
Copyright (c) 2014 Gavin Mogan
Licensed under the MIT license.

