var smartex     = require('../index');
var client     = smartex.createClient();

client.as('public').get('rates', function(err, rates) {
  console.log(err || rates);
});
