/**
 * Created by prabhaths on 3/13/16.
 */

var FeUtils = {};


var dollarSignEscape = "esc_Doll_sign__";
var nullValueEscape = "esc_Null_value__";
var underscoreValueEscape = "esc_Und_value__";
var objectIdEscapeStart = "esc_Obj_id__";
var objectIdEscapeEnd = "__end_Obj_id";

FeUtils.trim = function (str) {
  if (str && (typeof str === 'string')) {
    return str.trim();
  }
  return str;
};

FeUtils.revertDollarSignEscape = function (str) {
  if (str && (typeof str === 'string')) {
    return str.replace(dollarSignEscape,'$');
  }
  return str;
};

FeUtils.revertUnderscoreSignEscape = function (str) {
  if (str && (typeof str === 'string')) {
    return str.replace(underscoreValueEscape,'_');
  }
  return str;
};

FeUtils.revertNullValueEscape = function (str) {
  if (str && (typeof str === 'string')) {
    if(str==nullValueEscape){
      return null;
    }
  }
  return str;
};

FeUtils.clearKeysOfObject = function (jsonIn) {
  var retJson = {};
  _.each(jsonIn, function (f,k) {
    if(typeof f === 'object'){
      if(f.constructor != Array){
        f = FeUtils.clearKeysOfObject(f);
      }
    }

    //revert escaped keys
    k = FeUtils.trim(k);
    k = FeUtils.revertUnderscoreSignEscape(k);
    k = FeUtils.revertDollarSignEscape(k);

    //revert escaped fields
    f = FeUtils.revertUnderscoreSignEscape(f);
    f = FeUtils.revertDollarSignEscape(f);

    retJson[k] = f;
  });

  return retJson;
};

FeUtils.getJsonFromString = function (str, cb) {
  if( !str || str=='' ||  str.trim()=='' ){
    str = "{}";
  }

  //remove new lines
  str = str.replace('\n','');

  //escape starting with _ signs
  str = str.replace(/([\s\{\"]+)_/g, '$1'+underscoreValueEscape);

  //escape $ signs
  str = str.replace('$', dollarSignEscape);

  //escape null
  str = str.replace(/:\s*null/g, ':"'+nullValueEscape+'"');

  //escape object id
  str = str.replace(/ObjectId\([\"\']{1}([\w\d]*)[\"\']{1}\)/gi, '"'+objectIdEscapeStart+'$1'+objectIdEscapeEnd+'"');



  try{
    str = str.replace(/([a-z][^:]*)(?=\s*:)/g, '"$1"');
    var clearedJson = FeUtils.clearKeysOfObject( JSON.parse(str) );
    cb(null,clearedJson);
  } catch(err){
    console.log(str);
    cb(err);
  }

};
