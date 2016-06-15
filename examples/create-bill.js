var fs         = require('fs');
var HOME       = process.env['HOME'];
var bitauth    = require('bitauth');
var smartex     = require('../index');
var encPrivkey = fs.readFileSync(HOME + '/.smartex/api.key').toString();
var privkey    = bitauth.decrypt('', encPrivkey);
var client     = smartex.createClient(privkey);

client.on('error', function(err) {
    console.log(err);
});

client.on('ready', function() {

  var payload = {
    items: [
      { price: 10, quantity: 1, description: 'thing' }
    ],
    name: 'Bill',
    address1: '123 London St.',
    city: 'London',
    state: 'London',
    zip: 'SW12 3QN',
    country: 'UK',
    email: 'bill@smartex.io',
    phone: '5555555555',
    dueDate: new Date('2016-04-30'),
    currency: 'USD',
    showRate: true
  };

  client.post('bills', payload, function(err, bill) {
    console.log(err || bill);
  });

});
