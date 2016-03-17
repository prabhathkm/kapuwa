/**
 * Created by prabhaths on 3/11/16.
 */

var selectedObjects = {};
var allObjects = {};

var maxLevels = 4;

$(function() {

  loadDataSetView(1, true);
  loadDataSetView(2, false, true);


  $('.kapuwaMainContainer').on('click','.dataFetch', function(e){

    var set = $(this).data('set');

    var $dataSetFullAreaElem = $('#dataSetView'+set);
    $dataSetFullAreaElem.find('.dataSetArea').empty();

    var collectionIn = $('input#dataSetCollection'+set).val();
    var filterFieldsIn = $('textarea#dataSetFilterFields'+set).val();
    var visibleFieldsIn = $('textarea#dataSetVisibleFields'+set).val();
    var sortFieldsIn = $('textarea#dataSetSortFields'+set).val();
    var skipValueIn = $('input#dataSkipValue'+set).val();
    var captionField = $('input#dataSetCaptionField'+set).val();

    var independent = $(this).data('independent');
    var connectFrom = $('input#dataSetConnectFrom'+set).val();
    var connectTo = $('input#dataSetConnectTo'+set).val();


    //clear previous error marks
    $dataSetFullAreaElem.find('.form-group').removeClass('has-error');

    FeUtils.getJsonFromString(filterFieldsIn, function(err, filterFieldsJson){
      if(err){
        MESSAGE_BOT.addMessage("Error on 'Filters' field.", MESSAGE_BOT.MESSAGE_TYPES.ERROR);
        markComponentAsError($dataSetFullAreaElem,'dataSetFilterFields');
        console.log(err);
      } else {
        FeUtils.getJsonFromString(visibleFieldsIn, function(err, visibleFieldsJson){
          if(err){
            MESSAGE_BOT.addMessage("Error on 'Visible Fields' field.", MESSAGE_BOT.MESSAGE_TYPES.ERROR);
            markComponentAsError($dataSetFullAreaElem,'dataSetVisibleFields');
            console.log(err);
          } else {
            FeUtils.getJsonFromString(sortFieldsIn, function(err, sortFieldsJson){
              if(err){
                MESSAGE_BOT.addMessage("Error on 'Sort Options' field.", MESSAGE_BOT.MESSAGE_TYPES.ERROR);
                markComponentAsError($dataSetFullAreaElem,'dataSetSortFields');
                console.log(err);
              } else {
                fetchAndDrawDataSet(set, $dataSetFullAreaElem, visibleFieldsJson, filterFieldsJson , collectionIn, sortFieldsJson, skipValueIn, captionField, {
                  independent : independent,
                  connectFrom : connectFrom,
                  connectTo : connectTo
                });
              }
            });
          }
        });
      }
    });



  });


  // expand data obj
  $('.kapuwaMainContainer').on('click','.dataObject.hasChildren .caption', function(e){
    $(this).parent().children('.dataObjectSub').toggle();
    $(this).parent().toggleClass('expanded');
  });

  // data set prev
  $('.kapuwaMainContainer').on('click','.dataSetPrev', function(e){
    var setNo = $(this).data('set');
    var skipVal = $('#dataSkipValue'+setNo).val();
    var pageSize = $('#dataSkipValue'+setNo).data('pagesize');
    skipVal = parseInt(skipVal || 0);
    pageSize = parseInt(pageSize || 0);

    skipVal = skipVal-pageSize;
    if(skipVal<0){
      skipVal = 0;
    }
    $('#dataSkipValue'+setNo).val(skipVal);
    $('#dataFetch'+setNo).click();
  });

  // data set next
  $('.kapuwaMainContainer').on('click','.dataSetNext', function(e){
    var setNo = $(this).data('set');
    var skipVal = $('#dataSkipValue'+setNo).val();
    var pageSize = $('#dataSkipValue'+setNo).data('pagesize');
    var total = $('#dataSkipValue'+setNo).data('total');
    skipVal = parseInt(skipVal || 0);
    pageSize = parseInt(pageSize || 0);
    total = parseInt(total || 0);


    skipVal = skipVal+pageSize;
    if(skipVal>total){
      skipVal = total;
    }
    $('#dataSkipValue'+setNo).val(skipVal);
    $('#dataFetch'+setNo).click();
  });

  // data object navigate level
  $('.kapuwaMainContainer').on('click','.dataObjectNav', function(e){
    var $dataObjectElem = $(this).parent().find('.dataObject');
    var setNo = $dataObjectElem.data('set');
    var index = $dataObjectElem.data('index');
    selectedObjects[setNo] = (allObjects[setNo]||{})[index];

    $('#dataSetArea'+setNo).find('.dataObjectWrap').removeClass('selected');
    $(this).parent().addClass('selected');

    // mark on connecting set
    var connectingSetNo = (setNo+1);
    var markOnConnectionLevel = function () {
      var $nextDataSetViewElem = $('#dataSetView'+connectingSetNo);
      $nextDataSetViewElem.find('.dataSetFilters .connectFields').addClass('connected');

      if( !$nextDataSetViewElem.hasClass('initialLoad') ){
        $nextDataSetViewElem.find('.dataFetch').click();
      } else {
        $nextDataSetViewElem.find('.dataSetConnectFrom').focus();
      }
    };


    var $nextDataViewUi = $('#dataView_set'+connectingSetNo);
    //handle disabled UIs
    if($nextDataViewUi.hasClass('disabled')){
      $nextDataViewUi.find('.dataSetFilters').find('input, textarea, button').attr('disabled', false);
    }
    //handle collapsed UIs
    if($nextDataViewUi.hasClass('collapsed')){
      //load UI
      loadDataSetView(connectingSetNo, false, false, function () {
        $nextDataViewUi.removeClass('collapsed');
        markOnConnectionLevel();
      });
    } else {
      markOnConnectionLevel();
    }


  });




  // handle key strokes
  $('.kapuwaMainContainer').on('keypress','.dataSetFilters input, .dataSetFilters textarea',function (e) {
    var key = e.which;
    if (e.ctrlKey && e.keyCode == 13) {
      var setNo = $(this).data('set');
      if(setNo){
        $('#dataFetch'+setNo).click();
        return false;
      }
    }
    return true;
  });
  $('.kapuwaMainContainer').on('keypress','input.dataSkipValue',function (e) {
    var key = e.which;
    if (e.keyCode == 13) {
      var setNo = $(this).data('set');
      if(setNo){
        $('#dataFetch'+setNo).click();
        return false;
      }
    }
    return true;
  });


});


function fetchAndDrawDataSet(setNo, $dataSetFullAreaElem, visibleFieldsJson, filterFieldsJson, collectionIn, sortFieldsJson, skipValueIn, captionFieldIn, moreOpt){

  //clear previous error marks
  $dataSetFullAreaElem.find('.form-group').removeClass('has-error');

  $dataSetAreaElem = $dataSetFullAreaElem.find('.dataSetArea');
  moreOpt = moreOpt || {};

  collectionIn = FeUtils.trim(collectionIn);
  captionFieldIn = FeUtils.trim(captionFieldIn);
  if(captionFieldIn =='' ){
    captionFieldIn = '_id';
  }

  if(!selectedConnection){
    MESSAGE_BOT.addMessage("No database selected, select a connection on database manager.", MESSAGE_BOT.MESSAGE_TYPES.ERROR);
    $('#showDbManager').click();
    return true;
  }

  if(!collectionIn){
    MESSAGE_BOT.addMessage("No collection name defined.", MESSAGE_BOT.MESSAGE_TYPES.ERROR);
    markComponentAsError($dataSetFullAreaElem,'dataSetCollection');
    return true;
  }

  //connection filters
  if(!moreOpt.independent) {

    var selectedObject = selectedObjects[(setNo-1)];
    if(!selectedObject){
      MESSAGE_BOT.addMessage("No record selected on level-"+(setNo-1)+".", MESSAGE_BOT.MESSAGE_TYPES.ERROR);
      markComponentAsError($dataSetFullAreaElem,'dataSetConnectFrom');
      return true;
    }

    if(!moreOpt.connectFrom){
      MESSAGE_BOT.addMessage("No 'Connect From' field defined.", MESSAGE_BOT.MESSAGE_TYPES.ERROR);
      markComponentAsError($dataSetFullAreaElem,'dataSetConnectFrom');
      return true;
    }
    if(!moreOpt.connectTo){
      MESSAGE_BOT.addMessage("No 'Connect With' field defined.", MESSAGE_BOT.MESSAGE_TYPES.ERROR);
      markComponentAsError($dataSetFullAreaElem,'dataSetConnectTo');
      return true;
    }

    // add connection filters
    var connectVal = null;
    if(selectedObject[moreOpt.connectFrom]){
      connectVal = selectedObject[moreOpt.connectFrom];
    }
    filterFieldsJson[moreOpt.connectTo] = connectVal;
  }

  // loading
  $dataSetAreaElem.append('<div class="loader"></div>');

  DataManager.getDataSet({
    connection: selectedConnection,
    collection: collectionIn,
    filterFields: filterFieldsJson,
    visibleFields: visibleFieldsJson,
    sortFields: sortFieldsJson,
    skipValue: skipValueIn
  }, function (resp) {

    $dataSetAreaElem.find('.loader').remove();

    if(!resp.error){

      var selectedMatched = false;

      var addDataElem = function (dataObj, caption, value , $subElem, $targetElem, level, index) {
        var $dataElem = $('<div class="dataObject"></div>');
        $dataElem.addClass('level-'+level);
        var $dataElemCaption = $('<div class="caption"><b>'+ caption+'</b> : '+ value +'</div>');
        $dataElem.append($dataElemCaption);
        if($subElem){
          $dataElem.addClass('hasChildren');
          $dataElem.append($subElem);
          $subElem.css('display', 'none');
        }

        if(level==0){
          var $dataElemWrap = $('<div class="dataObjectWrap"></div>');
          $dataElem.attr('data-index',index);
          $dataElem.attr('data-set',setNo);
          $dataElem.attr('id','dataObject_level'+level+'_index'+index);
          $dataElemWrap.append($dataElem);
          // object nav
          if(setNo<maxLevels){
            $dataElemWrap.append('<div class="dataObjectNav"></div>');
          }

          // if selected found
          var selectedObject = selectedObjects[setNo] || {};
          if(selectedObject._id == dataObj._id){
            $dataElemWrap.addClass('selected');
            $('#dataSetView'+(setNo+1)).find('.connectFields').addClass('connected');
            selectedMatched=true;
          }

          $targetElem.append($dataElemWrap);
        } else {
          $targetElem.append($dataElem);
        }

      };

      var dataObjIterator = function (datObjSet, captionField, $targetElem, level) {
        _.each(datObjSet, function(dataObj, key){

          var caption = key;
          var value = dataObj;
          var $subElem = null;

          if(captionField){
            var forcedCaption = null;
            if(dataObj[captionField] && typeof dataObj[captionField]==='string'){
              forcedCaption = dataObj[captionField];
            }
            caption= forcedCaption || '_id:'+dataObj['_id'] ||  '#:'+key;
          }

          if(dataObj===null){
            value = null;
          } else if(typeof dataObj === 'object'){

            if(dataObj.constructor == Array){
              value = 'Array';
            }
            else if(dataObj.constructor == Object){
              value = 'Object';
            }

            value = value + ' ['+ _.size(dataObj)+']';

            if(level<=3){
              $subElem = $('<div class="dataObjectSub"></div>');
              dataObjIterator(dataObj, null, $subElem, (level+1));
            }

          }

          addDataElem( dataObj, caption, value, $subElem, $targetElem, level, key);

        });
      };

      //remove initial load tag
      $dataSetFullAreaElem.removeClass('initialLoad');

      //update level header
      $('#collectionInfo'+setNo).html(collectionIn);

      if( !resp.data || _.size(resp.data)==0){
        $('#dataSetArea'+setNo).html('<p class="col-xs-12 col-md-12">No records have been matched.</p>');
      } else {

        //updateAllObjects
        allObjects[setNo] = resp.data;

        dataObjIterator( resp.data, captionFieldIn, $dataSetAreaElem, 0);

        //expand first data object
        $dataSetAreaElem.find('.dataObjectWrap:first>.dataObject>.caption').click();

        //update counts
        var dataCount = _.size(resp.data);
        $('#dataSkipValue'+setNo).val(resp.skip);
        $('#dataSkipValue'+setNo).data('pagesize',resp.pageSize);
        $('#dataSkipValue'+setNo).data('total',resp.total);
        $('#dataCountTotal'+setNo).html(resp.total);
        $('#dataCountTo'+setNo).html(resp.skip + dataCount );
      }

      //update connected if not selected
      if(!selectedMatched){
        $('#dataSetView'+(setNo+1)).find('.connectFields').removeClass('connected');
      }


    } else {
      MESSAGE_BOT.addMessage("Data fetching error...", MESSAGE_BOT.MESSAGE_TYPES.ERROR);
      $dataSetAreaElem.append('<div class="error">'+resp.errorContent+'</div>');
      console.log(resp.errorContent);
    }
  });
}


// load data set ui
function loadDataSetView(setNo, independent, disabled, cb){
  cb = cb || function(){};

  var $dataView = $('#dataView_set'+setNo);
  $dataView.load( "/tpl/dataView.html", function() {

    //update level header
    $dataView.find('.levelNo').html(setNo);

    [ 'dataSetCollection',
      'dataSetFilterFields',
      'dataSetVisibleFields',
      'dataSetSortFields',
      'dataSkipValue',
      'dataSetCaptionField',
      'dataFetch',
      'dataSetConnectFrom',
      'dataSetConnectTo',
      'dataCountTo',
      'dataCountTotal',
      'dataSetPrev',
      'dataSetNext',
      'levelNo',
      'collectionInfo',

      'dataSetView',
      'dataSetArea'].forEach(function(field){
      $dataView.find('.'+field).attr('id',field+setNo);
      $dataView.find('.'+field).attr('data-set',setNo);
      $dataView.find('.'+field).attr('data-independent',independent);
    });

    //data set view with level
    $dataView.addClass('level'+setNo);

    if(independent){
      ['connectFields'].forEach(function(field){
        $dataView.find('.'+field).remove();
      });
    } else {
      //add initial load tag
      $dataView.find('.dataSetView').addClass('initialLoad');
    }

    if(disabled){
      $dataView.find('.dataSetFilters').find('input, textarea, button').attr('disabled', true);
      $dataView.addClass('disabled');
    }

    cb();

  });
}

// mark error fields
function markComponentAsError($parentElem, className) {
  $parentElem.find('.form-group:has(.'+className+')').addClass('has-error');
}


