/**
 * Created by prabhaths on 3/11/16.
 */

/**
 * Data related communication handler
 */
var DataManager = {

  getDataSet : function (opt, cb) {
    ajaxPostModel( "/data/getDataSet", opt, cb);
  },

  createConnection : function (opt, cb) {
    ajaxPostModel( "/data/createConnection", opt, cb);
  },

  getConnections : function (opt, cb) {
    ajaxPostModel( "/data/getConnections", opt, cb);
  },

  removeConnection : function (opt, cb) {
    ajaxPostModel( "/data/removeConnection", opt, cb);
  }

};


var ajaxReq = null;
var prevReq = null;
var ajaxCall = function(ajaxParam, successFunction, errorFunction, completeFunction) {

  var ajaxBody = {};

  _.each(ajaxParam, function(value, key){
    ajaxBody[key] = value;
  });

  ajaxBody['beforeSend'] = function(jqXHR, jqReq){
    //abort previous request if its for the same target
    if(prevReq && prevReq.url === jqReq.url && prevReq.type === jqReq.type){
      if(ajaxReq != null){
        ajaxReq.abort();
      }
    }

    prevReq = jqReq
  };

  ajaxBody['success'] = successFunction;

  ajaxBody['error'] = function(jqXHR, status, errorThrown) {

    if(jqXHR.status == "401") {
      window.location.href = "/";
    }

    if(typeof errorFunction == "function") {
      errorFunction(jqXHR, status, errorThrown);
    }
  };

  ajaxBody['complete'] = function(jqXHR, status) {
    if(typeof completeFunction == "function") {
      completeFunction(jqXHR, status);
    }
  };

  ajaxReq = jQuery.ajax(ajaxBody);
};


var ajaxPostModel = function (url,data,cb) {
  ajaxCall({
      url: url,
      type: "POST",
      dataType: 'json',
      data: data
    },
    function(resp) {
      cb(resp);
    });
};

