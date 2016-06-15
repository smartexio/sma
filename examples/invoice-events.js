var fs         = require('fs');
var HOME       = process.env.HOME;
var bitauth    = require('bitauth');
var smartex     = require('..');
var encPrivkey = fs.readFileSync(HOME + '/.smartex/api.key').toString();
var privkey    = bitauth.decrypt('', encPrivkey);
var client     = smartex.createClient(privkey);

client.on('error', function(err) {
  console.log(err);
});

client.on('ready', function() {

  // create an invoice
  client.as('pos').post('invoices', {
    price: 10,
    currency: 'USD'
  }, function(err, invoice) {
    if (err) return console.log(err);

    // get event bus token
    client.as('public').get(invoice.path + 'events', function(err, buspass) {
      if (err) return console.log(err);

      var data = {
        token: buspass.token,
        action:'subscribe',
        events: ['payment']
      };

      // pipe event stream request through smartex.EventParser
      var events = client.as('public').get('events', data);
      var parser = new smartex.EventParser();

      events.pipe(parser).on('payment', function(invoice) {
        console.log('invoice is ' + invoice.status);
      });
    });
  });

});
