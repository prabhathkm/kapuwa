/**
 * Created by prabhaths on 3/14/16.
 */

// message bot
var MESSAGE_BOT = {};


MESSAGE_BOT.MESSAGE_TYPES={
  LONG_STAY: { class: 'longstay', timeOut: 6000 },
  ERROR: { class: 'error', timeOut: 2000 },
  WARNING: { class: 'warning', timeOut: 2000 }
};
var messageBotRunning = false;
var messageDisplayTime = 1000;
var messageTimeoutHandle = null;
var removeMsgAndDisplayNext = function(ele){
  if(!ele){
    ele = $('.messageBox .message:not(.hidden)').first();
  }
  ele.fadeOut('fast', function () {
    ele.remove();
    var msgArea = $('.messageBox .message.hidden');
    if(msgArea.size()>0){
      executeMessage(msgArea.first())
    } else {
      messageBotRunning=false;
    }
  });
};
var runMessageBot = function(ele){
  if(!messageBotRunning){
    var firstMessage = $('.messageBox .message.hidden').first();
    executeMessage(firstMessage);
  }
};
var executeMessage = function(msgEle){
  msgEle.removeClass('hidden');
  if(messageTimeoutHandle){
    window.clearTimeout(messageTimeoutHandle);
  }
  messageBotRunning = true;
  var timeOut = msgEle.data('timeout') || messageDisplayTime;
  messageTimeoutHandle = window.setTimeout(function() {
    removeMsgAndDisplayNext();
  }, timeOut);
};

MESSAGE_BOT.addMessage = function(msg, type){
  var msgEle = $('<div class="message">'+msg+'</div>');
  if(type){
    msgEle.addClass(type.class);
    msgEle.data('timeout',type.timeOut);
  }
  msgEle.addClass('hidden');
  $('.messageBox').append(msgEle);
  runMessageBot();
};
// END message bot