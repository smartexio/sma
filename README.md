Smartex Node.js API Client
==========================

[![Build Status](https://travis-ci.org/smartexio/smartex-node-client.svg)](https://travis-ci.org/bitpay/node-bitpay-client)

A Node.js module and command line client for interacting with
[Smartex's Secure API](https://smartex.io).

## Getting Started

Install using [Node Package Manager](https://www.npmjs.org/).

```
~# npm install smartex-node-client
```

If you do not use NPM to install (instead cloning this repository), you will
need to run the following from the project root:

```
~# npm run setup
```

### Pairing

Set up your client's private key:

```
./node_modules/smartex-node-client/bin/smartex.js keygen
< enter a password, or hit enter for no password >
Generating keys...
Keys saved to: /Users/<your_username>/.smartex
```
Next you have to pair up your client's private key with your smartex account. This is done by requesting a pairing code:

```
./node_modules/smartex-node-client/bin/smartex.js pair
Do you have a pairing code?
no < hit enter twice >
Okay, we can get a pairing code, please choose a facade:
  1) Point of Sale // Just want to make invoices
  2) Merchant      // Want to have full account access
```
This will spit out a bunch of output. At the end of it will be a URL:
```
Pair this client with your organization:
https://smartex.io/api-access-request?pairingCode=XXX
```
Visit this URL in your browser and hit the approve button. Afterwards, you can test creating a basic invoice from the command line like this:

```
//If you selected #1 then use this:
./node_modules/smartex-node-client/bin/smartex.js request -T pos -X post -R invoices -P '{"price": 1, "currency": "USD"}'
//If you selected #2 then use this:
./node_modules/smartex-node-client/bin/smartex.js request -T merchant -X post -R invoices -P '{"price": 1, "currency": "USD"}'
```
If it worked, you'll see some JSON outputted regarding the newly created invoice. If you get an error like this:
```
Error: { error: 'Invalid token' }
```
Then something is wrong, either you used the wrong line, or you haven't approved the token yet in the smartex dashboard.


For this utility Smartex's test platform is used by default, so if you want to use the regular production platform (ie. smartex.io and not test.smartex.io), do this:
```
./node_modules/smartex-node-client/bin/smartex.js config --use prod
```
You'll need to pair again as well to get a new token for the production environment.


## Usage

### CLI

Use the `smartex` command line program to generate your client keys and
associate them with your account.

```
~# cd smartex-node-client && npm link
~# smartex keygen
~# smartex pair
```

If you switch your environment a lot, you can avoid editing your config file:

```
~# smartex config --use prod
~# smartex config --use test
```

You can even create custom preset configurations:

```
~# smartex config --set apiHost --value smartex.test
~# smartex config --save local
~# smartex config --use local
```

Last but not least, you can issue API requests directly from the command line:

```
~# smartex request -T merchant -R invoices -P '{"dateStart":"2016-04-06"}'
```

For more information on how to use the CLI, run:

```
~# smartex --help
```

### Module

To use this as a client library you'll actually need both smartex and bitauth.

Here's a basic example for creating an invoice:
```js
var smartex = require('smartex-node-client');
// need bitauth too
var bitauth = require('bitauth');

// NOTE: necessary to decrypt your key even if you didn't enter a password when you generated it.
// If you did specify a password, pass it as the first param to bitauth.decrypt()
var privkey = bitauth.decrypt('', fs.readFileSync('/path/to/.smartex/api.key', 'utf8'));

var client = smartex.createClient(privkey);
client.on('error', function(err) {
  // handle client errors here
  console.log(err);
});

//Client will take a second to automatically load your tokens, after which it will emit this ready event
//You must wait for the ready event before issuing requests
client.on('ready', function(){
  var data = {
    price: 1,
    currency: 'USD'
  };

  // NOTE: the .as('pos') is necessary for Point of Sale requests, use as('merchant') if you have a merchant token instead
  client.as('pos').post('invoices', data, function(err, invoice) {
    if (err){
      // more error handling
      console.log(err);
    }
    else{
      // success
      console.log('invoice data', invoice);
    }
  });
});
```

When resources are returned, they get extended with the same methods as the
`client`, so you can chain requests onto them. For instance, to get the refunds
associated with the first invoice returned from the example above:

```js
client.get('invoices', function(err, invoices) {
    invoices[0].get('refunds', function(err, refunds) {
        console.log(err || refunds);
    });
});
```

Arguments for creating invoices can be viewed here: https://smartex.io/api

### Overloading Configuration

The Smartex client loads a configuration file from `~/.smartex/config.json` by
default, which it creates after installation. You can override this default
configuration, by passing a `config` value in the options argument.

Example:

```js
var client = smartex.createClient(privKey, {
  config: {
    apiHost: 'smartex.io',
    apiPort: 443
  }
});
```

### Assuming a Different Facade

Some operations in the API are only available to certain "facades", which
restrict access to different functionality. By default, all requests are sent
using the **merchant** facade. To assume a different facade, you can use the
`as()` method.

```js
client.as('payroll').get('payouts', { status: 'new' }, function(err, payouts) {
    async.eachSeries(payouts, function(payout, done) {
        payout.put({ status: 'cancelled' }, done);
    }, function(err) {
        console.log('Cancelled all new payout requests.');
    });
});
```

### Streaming Responses

All of the `client` methods return a `Stream`, which you may use for more
custom implementations. Here is a very rudimentary example using
[Clarinet](https://github.com/dscape/clarinet), a streaming JSON parser.

```js
var parser = require('clarinet').createStream();
var count  = 0;

parser.on('key', function(key) {
  if (key === 'id') {
    parser.once('value', function(val) {
      count++;
      console.log('Got invoice: ' + val);
    });
  }
});

parser.on('end', function() {
  console.log('Streamed ' + count + ' invoices!');
});

client.get('invoices').pipe(parser);
```