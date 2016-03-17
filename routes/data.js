var express     = require('express');
var router      = express.Router();
var _           = require('lodash');
var ObjectID    = require('mongodb').ObjectID;
var uuid        = require('node-uuid');

var DbConnector     = require('../lib/dbConnector.js');
var EncryptionManager     = require('../lib/encryptionManager.js');


// handle console outs
var consoleOut = function (text) {
  var tm = 'tm';
  console.log(tm, text);
};

var maxRecordLimit = 50;



/**
 * Data routes to serve UI
 */

router.post('/getDataSet/', function(req, res, next) {

  var dbConnection = req.body.connection;

  var visibleFields = req.body.visibleFields || {};
  _.each(visibleFields, function(field,key){
    visibleFields[key] = parseInt(field);
  });

  var filterFields = req.body.filterFields || {};

  var collection = req.body.collection || null;

  var sortFields = req.body.sortFields || {};
  _.each(sortFields, function(field,key){
    sortFields[key] = parseInt(field);
  });

  var skipValue = parseInt(req.body.skipValue) || 0;

  // filters -  more cleanings
  function cleanStringField(f){
    //revert objectId escaped
    if ( typeof f === 'string' ) {

      // revert object id
      var found = f.match(/esc_Obj_id__([\w\d]*)__end_Obj_id/);
      if (found) {
        f = new ObjectID(found[1]);
      }

      //revert boolean values
      var foundBool = f.match(/true|false{1}/gi);
      if (foundBool) {
        f = (f.toLowerCase()=='true');
      }

      //revert null values
      var foundNull = f.match(/esc_Null_value__/);
      if (foundNull) {
        f = null;
      }
    }
    return f;
  }
  function cleaningNestedObject(obj){
    if(typeof obj === 'string'){
      obj = cleanStringField(obj);
    } else if(typeof obj === 'object'){
      _.each(obj, function (f,k) {
        obj[k] = cleaningNestedObject(f);
      });
    }
    return obj;
  }

  // clean filter fields
  filterFields = cleaningNestedObject(filterFields);


  DbConnector.getConnection(dbConnection, function (err,db) {
    if(err) {
      consoleOut(err);
      res.send( JSON.stringify({ error: true, errorContent:err }) );
    } else {

      if(collection){

        db.collection(collection).count(filterFields, function (err, count) {
          db.collection(collection).find(
            filterFields,
            visibleFields
          ) .sort(sortFields)
            .skip(skipValue)
            .limit(maxRecordLimit)
            .toArray( function(err, results){

              if (err) {
                consoleOut(' No matching record. ' + err);
                res.send( JSON.stringify({ error: true, errorContent:err }) );
              } else {
                res.send( JSON.stringify({error: false, data: results, total: count , skip:skipValue, pageSize: maxRecordLimit }) );
              }

          });
        });

      } else {
        consoleOut('No collection');
        res.send( JSON.stringify({ error: true, errorContent:'Invalid collection details' }) );
      }

    }
  });

});



router.post('/getCollections/', function(req, res, next) {

  var dbConnection = req.body.connection;
  DbConnector.getConnection(dbConnection, function (err,db) {
    if(err) {
      consoleOut(err);
    } else {

      db.listCollections().toArray( function(err, collections) {
        console.log(err, collections);
      });

    }
  });

});


router.post('/createConnection', function(req, res, next) {

  var dbDetails = req.body.dbDetails || {};

  //decrypt
  _.each(['serverAddress','serverPort','dbName','username','password'], function (fName) {
    if(dbDetails[fName]){
      dbDetails[fName] =  EncryptionManager.decrypt(dbDetails[fName]);
    }
  });


  if(dbDetails.connectionName && dbDetails.serverAddress && dbDetails.serverPort && dbDetails.dbName){
    var dbUrlParts = ['mongodb://'];
    if(dbDetails.username){
      dbUrlParts = dbUrlParts.concat([dbDetails.username,':', encodeURIComponent(dbDetails.password) ,'@']);
    }
    dbDetails.serverPort = parseInt(dbDetails.serverPort) || null;
    dbUrlParts = dbUrlParts.concat([dbDetails.serverAddress,':',dbDetails.serverPort,'/',dbDetails.dbName]);

    var dbUrl = dbUrlParts.join('');
    var dbTag = uuid.v1();
    DbConnector.newConnection(dbTag,dbUrl, function () {
      DbConnector.getConnection(dbTag, function(err, db){
        if(err) {
          res.send( JSON.stringify({ error: true, errorContent:err }) );
        } else {

          // update sessions with new db
          var currentDbList = req.session.dbList || {};
          currentDbList[dbTag]= {
            name: dbDetails.connectionName,
            dbTag: dbTag,
            server: dbDetails.serverAddress,
            db: dbDetails.dbName
          };
          req.session.dbList = currentDbList;

          res.send( JSON.stringify({ error: false, dbTag:dbTag }) );
        }
      });
    });
  } else {
    res.send( JSON.stringify({ error: true, errorContent:'Incomplete DB parameters.' }) );
  }

});

router.post('/getConnections', function(req, res, next) {
  var filters = req.body.filters || {};
  var dbList = req.session.dbList || {};
  res.send( JSON.stringify({ error: false, dbList:dbList }) );
});

router.post('/removeConnection', function(req, res, next) {
  var dbTag = req.body.dbTag;
  var currentDbList = req.session.dbList || {};
  delete currentDbList[dbTag];
  req.session.dbList = currentDbList;
  res.send( JSON.stringify({ error: false, dbTag:dbTag }) );
});

module.exports = router;