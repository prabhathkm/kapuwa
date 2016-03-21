/**
 * Created by prabhaths on 3/16/16.
 */

var connections = null;
var selectedConnection = null;

var collectionList = [];

$(function() {

  // initiate db manager
  $('#showDbManager').on('click', function(e){
    updateDbList();
  });

  // select connection
  $('.dbList').on('click','.connection', function(e){
    selectConnection(connections[$(this).data('dbtag')]);
    $('#dbSelector').modal('hide');
  });

  // remove connection
  $('.dbList').on('click','.connection .deleteCon', function(e){
    var dbTag = $(this).parent().data('dbtag');
    DataManager.removeConnection({
      dbTag: dbTag
    }, function (resp) {
      if(selectedConnection==dbTag){
        selectConnection(null);
      }
      updateDbList(true);
    });
    return false;
  });


  // new connection
  $('#dbSelector').on('click','#newConnection', function(e){

    var connectionName = $('input#dbConnectionName').val();
    var serverAddress = $('input#dbServerAddress').val();
    var serverPort = $('input#dbServerPort').val();
    var dbName = $('input#dbName').val();
    var username = $('input#dbUsername').val();
    var password = $('input#dbPassword').val();

    var $newDbArea = $('.newDb');
    var error = false;

    //clear old error marks
    $newDbArea.find('.form-group ').removeClass('has-error');


    if(!connectionName){
      MESSAGE_BOT.addMessage("Error on 'Connection Name'.", MESSAGE_BOT.MESSAGE_TYPES.ERROR);
      markComponentAsError($newDbArea,'dbConnectionName');
      error=true;
    }
    if(!serverAddress){
      MESSAGE_BOT.addMessage("Error on 'Server Address'.", MESSAGE_BOT.MESSAGE_TYPES.ERROR);
      markComponentAsError($newDbArea,'dbServerAddress');
      error=true;
    }
    if(!serverPort){
      MESSAGE_BOT.addMessage("Error on 'Server Port'.", MESSAGE_BOT.MESSAGE_TYPES.ERROR);
      markComponentAsError($newDbArea,'dbServerPort');
      error=true;
    }
    if(!dbName){
      MESSAGE_BOT.addMessage("Error on 'Database'.", MESSAGE_BOT.MESSAGE_TYPES.ERROR);
      markComponentAsError($newDbArea,'dbName');
      error=true;
    }
    //if(!username){
    //  MESSAGE_BOT.addMessage("Error on 'Username'.", MESSAGE_BOT.MESSAGE_TYPES.ERROR);
    //  markComponentAsError($newDbArea,'dbUsername');
    //  error=true;
    //}
    //if(!password){
    //  MESSAGE_BOT.addMessage("Error on 'Password'.", MESSAGE_BOT.MESSAGE_TYPES.ERROR);
    //  markComponentAsError($newDbArea,'dbPassword');
    //  error=true;
    //}

    if(!error){

      //encrypt
      var encrypt = new JSEncrypt();
      encrypt.setPublicKey(rootData.pubKey);
      serverAddress = encrypt.encrypt(serverAddress);
      serverPort = encrypt.encrypt(serverPort);
      dbName = encrypt.encrypt(dbName);
      username = encrypt.encrypt(username);
      password = encrypt.encrypt(password);


      DataManager.createConnection({
        dbDetails: {
          connectionName: connectionName,
          serverAddress: serverAddress,
          serverPort: serverPort,
          dbName: dbName,
          username: username,
          password: password
        }
      }, function (resp) {
        if (!resp.error) {

          _.each(['input#dbConnectionName',
            'input#dbServerAddress',
            'input#dbServerPort',
            'input#dbName',
            'input#dbUsername',
            'input#dbPassword'],function (field) {
            $('#'+field).val('');
          });

          updateDbList();
        } else {
          MESSAGE_BOT.addMessage("Error creating connection to database.", MESSAGE_BOT.MESSAGE_TYPES.ERROR);
        }
      });
    }

  });
});

function updateDbList(avoidAutoSelect){
  var $dbListArea = $('.dbList');
  $dbListArea.empty();

  // loading
  $dbListArea.append('<div class="loader"></div>');

  DataManager.getConnections({}, function (resp) {
    // remove loading
    $dbListArea.find('.loader').remove();
    if (!resp.error) {
      var conCount = _.size(resp.dbList);
      if(conCount>0){


        connections=resp.dbList;

        _.each(resp.dbList, function(con){
          // if only one con select it to make things easy for a simple user
          //if(!avoidAutoSelect && conCount==1){
          //  selectConnection(con);
          //}
          var $connection = $('<div class="connection"></div>');
          $connection.append('<div class="caption">'+con.name+'</div><div class="desc">Server: <span>'+con.server+'</span>Database: <span>'+con.db+'</span></div>');
          $connection.append('<div class="deleteCon">X</div>');
          if(con.dbTag == selectedConnection){
            $connection.addClass('selected');
          }
          $connection.attr('data-dbtag',con.dbTag);
          $dbListArea.append($connection);
        });

      } else {
        $dbListArea.append('<div class="noCon">No connections available at the moment, Please create a one using below...</div>');
      }
    } else {
      MESSAGE_BOT.addMessage("Error on fetching connections.", MESSAGE_BOT.MESSAGE_TYPES.ERROR);
    }
  });

}

// select connection
function selectConnection(con){
  if(con){
    selectedConnection = con.dbTag;
    $('#connectionDetails .name').html(con.name);
    $('#connectionDetails .desc').html('<span>Server: </span>'+con.server+'<span>Database: </span>'+con.db);

    // get collections
    DataManager.getCollections({
      connection: con.dbTag
    }, function (resp) {
      if(!resp.error){
        collectionList = resp.collections;
        updateCollectionSuggestions();
      } else {
        console.log(resp.error, resp.errorContent);
      }
    });

  } else {
    selectedConnection = null;
    collectionList = null;
    $('#connectionDetails .name').html('');
    $('#connectionDetails .desc').html('');
  }
}