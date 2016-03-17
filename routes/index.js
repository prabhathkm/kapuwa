/**
 * Created by prabhaths on 3/6/16.
 */

var express   = require('express');
var router    = express.Router();
var _         = require('lodash');

var DbConnector     = require('../lib/dbConnector.js');
var EncryptionManager     = require('../lib/encryptionManager.js');

/**
 * Landing route
 */
router.get('/', function(req, res, next) {
  //var token = req.query.t;

  res.render('index', {
    data: {
      pubKey: EncryptionManager.getPublicKey()
    }
  });

});









module.exports = router;