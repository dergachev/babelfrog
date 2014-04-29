chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  jQuery(function($){
    gotGreek.boot(request.srcLang, request.targetLang);
  });
});
