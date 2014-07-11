# http_bouncer_server

[![Build Status](https://travis-ci.org/halkeye/http_bouncer_server.png?branch=master)](https://travis-ci.org/halkeye/http_bouncer_server)
[![Dependency Status](https://gemnasium.com/halkeye/http_bouncer_server.png)](https://gemnasium.com/halkeye/http_bouncer_server)
[![Stories in Ready](https://badge.waffle.io/halkeye/http_bouncer_server.png?label=ready&title=Ready)](https://waffle.io/halkeye/http_bouncer_server)

Public service that 'rebroadcasts' http hits to any clients listening. (See: [http_bouncer_client](https://www.npmjs.org/package/http_bouncer_client))

## Getting Started

### Own Server / Development

* `npm install http_bouncer_server`
* `node node_modules/http_bouncer_server/index.js`

### Heroku

* `heroku create`
* `heroku labs:enable websockets`
* `git push heroku master`

## Using

* Setup application to hit created server (see Getting Started)
    * Format should be [server]/handler/[keyname]/[regular path]
    * `curl -v  -d "{ \"asdadasd\" : \"good\" }" "http://localhost:5000/handler/gavin/this/is/my/url?blah=1" --header "Content-Type:application/json"`
* Setup client to listen to handle (See: [http_bouncer_client](https://www.npmjs.org/package/http_bouncer_client))
    * `http_bouncer_client -s http://localhost:5000/ -c 'gavin:http://localhost/dev_application?query_string_to_merge=1'`

## Release History

0.0.2 - 2014-07-11

* Added documentation and examples
* Updated dependancies

0.0.1 - 2014-06-17

* Initial Release

## License
Copyright (c) 2014 Gavin Mogan
Licensed under the MIT license.

