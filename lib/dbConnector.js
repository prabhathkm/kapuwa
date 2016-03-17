var MongoClient = require("mongodb").MongoClient;

//////////////////////////////
// DB CONNECTOR
// v2.0.0
DbConnector = (function() {
  var self = {};
  var pub = {};

  //db connection links from settings
  self.link = {};

  // New connection
  self.createConnectionGeneric = function( connectionLinkTag ,cb){
    try{
      MongoClient.connect( self.link[connectionLinkTag], function(err, db) {
        if (err) {
          console.log('[DbConnector] ## Failed to connect '+connectionLinkTag+' : ' + err);
          cb('Failed to connect : ' + err, null);
        } else {
          console.log('[DbConnector] ## Connection created to '+connectionLinkTag+'.');
          self[connectionLinkTag] = db;
          self[connectionLinkTag].close = function(){
            console.log('[DbConnector] ##  '+connectionLinkTag+' close called');
            self[connectionLinkTag]=null;
          };
          cb(null, self[connectionLinkTag]);
        }
      });
    } catch(e){
      cb('Failed to connect : ' + e, null);
    }

  };

  // Serve Generic connection
  self.getGenericConnection = function( dbRelatedTag ,cb){
    if(self[dbRelatedTag]){
      cb(null, self[dbRelatedTag]);
    }
    else{
      self.createConnectionGeneric(dbRelatedTag, function(err,db){
        cb(err,db);
      })
    }
  };

  //Register connection
  pub.newConnection = function(dbTag, dbUrl, cb){
    self.link[dbTag] = dbUrl;
    cb();
  };

  // Serve connection
  pub.getConnection = function(dbTag, cb){
    if(self.link[dbTag]){
      self.getGenericConnection( dbTag, cb);
    } else {
      cb('DB connection not found..');
    }

  };





  return pub;
})();

module.exports = DbConnector;