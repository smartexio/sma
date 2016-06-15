# Using Smartex with Node.js

## Prerequisites
You must have a Smartex merchant account to use this library.  It's free to [sign-up for a Smartex merchant account](https://smartex.io/dashboard/signup).

Once you have a Smartex merchant account, you will need [a working Smartex Access Token](/api) – this can be done either [via the library](#pairing) or manually in [The Smartex Dashboard](https://smartex.io/tokens).

## Node.js Quick Start

Using Smartex with your Node.js project is extremely simple.  Once you've [registered a Smartex account][smartex registration], install the `smartex` project via <abbr title="node package manager" class="tooltipped">npm</abbr>:

```bash
$ cd <your project folder>
```
You'll notice that we've added the `--save` parameter to automatically save the Smartex library to your `package.json` file.

Now, in your Node application, creating an Invoice is as simple as follows:

### Creating An Invoice

```javascript
var Smartex  = require('smartex');
var privkey = fs.readFileSync('path/to/private.key');
var smartex  = Smartex.createClient( privkey );

smartex.on('ready', function() {
  smartex.post('invoices', function(err, invoice) {
    console.log(err || invoice);
  });
});

```
You will receive either an `err` if any error took place, or an `invoice` if the invoice was successfully created.

### Issuing A Refund
Every Invoice on Smartex has a "refunds" subcollection.  To create a refund request, POST into it:

```javascript
smartex.post('invoices/:invoiceID/:refunds', function(err, refundRequest) {
  
});
```

### Create a Recurring Bill
```javascript
smartex.post('subscriptions', {
  billData: {/*...*/},// type: Bill.  See the Bill Schema.
  schedule: 'monthly' // type: enumerable, ['weekly', 'monthly', 'quarterly', 'yearly']
})
```

Bill Schema: https://smartex.io/api


[smartex registration]: https://smartex.io/dashboard/signup