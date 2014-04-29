chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // flag to designate type of message
  if (request.msgId != 'bootBabelFrog') {
    return;
  }

  jQuery(function($){
    gotGreek.boot(request.srcLang, request.targetLang);
  });
});
