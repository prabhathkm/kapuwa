/**
 * Created by prabhaths on 3/16/16.
 */

var NodeRSA = require('node-rsa');

EncryptionManager = (function() {
  var self = {};
  var pub = {};

  var key = new NodeRSA({b: 512});
  key.setOptions({
    encryptionScheme: 'pkcs1'
  });
  var pubKey = key.exportKey('pkcs8-public');

  // get public key
  pub.getPublicKey=function(){
    return pubKey;
  };


  // decrypt using private key
  pub.decrypt = function (str) {
    try{
      var decrypted = key.decrypt(str, 'utf8');
      return decrypted;
    } catch(e){
      console.log(e);
    }
    return null;
  };

  return pub;
})();

module.exports = EncryptionManager;