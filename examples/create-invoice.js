var fs         = require('fs');
var HOME       = process.env['HOME'];
var bitauth    = require('bitauth');
var smartex     = require('../index');
var encPrivkey = fs.readFileSync(HOME + '/.smartex/api.key').toString();
var privkey    = bitauth.decrypt('', encPrivkey);
var client     = smartex.createClient(privkey);

var data = {
  price: 100,
  currency: 'USD',
  notificationURL: 'http://your-ipn-server'
};

client.on('error', function(err) {
    console.log(err);
});

client.on('ready', function() {

  client.as('merchant').post('invoices', data, function(err, invoice) {
    console.log(err || invoice);
  });

});
