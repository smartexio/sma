function hashPassword(password, callback) {
  var crypto     = require('crypto');
  var salt       = '..............';
  var iterations = 200;
  var keylen     = 64;
  var digest     = 'sha512'

  crypto.pbkdf2(password, salt, iterations, keylen, digest, function(err, derivedKey) {
    if(err) {
      console.log(err);
    }
    callback(err, derivedKey.toString('hex'));
  });
};

module.exports = hashPassword;
