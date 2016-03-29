/**
 * Created by prabhaths on 3/11/16.
 */

/**
 * Data related communication handler
 */
var DataManager = {

  getDataSet : function (opt, cb) {
    ajaxPostModel([
        1, opt.collection
    ],"/data/getDataSet", opt, cb);
  },

  createConnection : function (opt, cb) {
    ajaxPostModel([
      2, opt.dbDetails.serverAddress
    ],"/data/createConnection", opt, cb);
  },

  getConnections : function (opt, cb) {
    ajaxPostModel([
      3
    ],"/data/getConnections", opt, cb);
  },

  removeConnection : function (opt, cb) {
    ajaxPostModel([
      4, opt.dbTag
    ],"/data/removeConnection", opt, cb);
  },

  getCollections : function (opt, cb) {
    ajaxPostModel([
      5, opt.connection
    ],"/data/getCollections", opt, cb);
  }

};


var ajaxCallStack = {};
var ajaxPostModel = function (idFields, url,data,cb) {
  //make ajax call type id
  var callId = idFields.join('_x_');
  if(!ajaxCallStack[callId]){
    ajaxCallStack[callId]=1;
    $.ajax({
      url: url,
      type: "POST",
      dataType: 'json',
      data: data,
      success: function (resp) {
        cb(resp);
        delete ajaxCallStack[callId];
      },
      error: function (status, err) {
        cb({
          error: status,
          errorContent: err
        });
        delete ajaxCallStack[callId];
      }
    }).fail(function (jqXHR, textStatus, errorThrown) {
      MESSAGE_BOT.addMessage('Communication Error', MESSAGE_BOT.MESSAGE_TYPES.ERROR);
    });
  } else {
    cb({
      error: 'repeatCalls to'+url,
      errorContent: 'One request already pending..',
      ajaxBlocked: true
    });
  }


};

