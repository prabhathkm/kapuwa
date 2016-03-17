var _ = require('underscore');


var Util = {

  getDate: function getDateFunc(date) {
    var today;
    if (date) {
      today = new Date(date);
    } else {
      today = new Date();
    }
    return today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
  },

  getTimeStamp: function getTimeStampFunc() {
    var now = new Date();
    var milliSeconds = now.getMilliseconds() > 99 ? now.getMilliseconds() : '0' + now.getMilliseconds();
    return now.getFullYear() + '-' +
      (now.getMonth() + 1) + '-' +
      now.getDate() + '_' +
      now.getHours() + '.' +
      now.getMinutes() + '.' +
      now.getSeconds() + '.' +
      milliSeconds;
  },

  logMsg: function logMsgFunc(msg, isError) {
    var log = console.log;
    var prefix = '';
    if (isError) {
      log = console.error;
      prefix = '[ ERROR ] ';
    }
    log('[' + this.getTimeStamp() + ']' + prefix + msg);
  },


  formatTime: function formatTimeFunc(minues) {
    var hours = Math.floor(Math.ceil(minues) / 60);
    var minutes = Math.ceil(minues) % 60;
    var timeString = (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes);
    return timeString;
  },

  trim: function trimFunc(str) {
    if (str && (typeof str === 'string')) {
      return str.trim();
    }
    return str;
  },

  lowercase: function lowercaseFunc(str) {
    if (str && (typeof str === 'string')) {
      return str.toLowerCase();
    }
    return str;
  }


};


Util.camelize = function (str) {
  if (str && (typeof str == 'string')) {
    str = Util.trim(str);
    // do not perform if already in valid cam case
    if (str.match(/[\/\-\,\s]/g) || str.charAt(0).toUpperCase() == str.charAt(0)) {
      str = str.replace(/[\/\-\,\s]/g, " ");
      str = Util.lowercase(str);
      return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
        if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
        return index == 0 ? match.toLowerCase() : match.toUpperCase();
      });
    }
  }
  return str;
};


Util.isNullOrEmpty = function (str) {
  str = Util.trim(str);
  if (!str || str == '') {
    return true;
  }
  return false;
};


module.exports = Util;
