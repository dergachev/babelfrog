chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // flag to designate type of message
  if (request.msgId != 'bootBabelFrog') {
    return;
  }


  var extensionSuccessCallback = function(translation) {
    // gotGreek.showMessage(translation, x, y);
    gotGreek.callbacks.standardSuccessCallback(translation);
    if (request.vocalize) {
      chrome.runtime.sendMessage({msgId: "vocalize", text: gotGreek.currentJob.text});
    }
  }

  jQuery(function($){
    gotGreek.boot({
      source: request.srcLang,
      target: request.targetLang,
      successCallback: extensionSuccessCallback,
      googleApiKey: request.googleApiKey,
      googleTranslateJsonp: false
    });
  });

});
