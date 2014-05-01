chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // flag to designate type of message
  if (request.msgId != 'bootBabelFrog') {
    return;
  }

  /**
   * Override standardSuccesCallback to also play audio.
   *
   **/
  var extensionSuccessCallback = function(translation) {
    gotGreek.callbacks.standardSuccessCallback(translation);
    if (request.vocalize) {
      // vocalize must be run from background.js
      chrome.runtime.sendMessage({msgId: "vocalize", text: gotGreek.currentJob.text});
    }
  }

  /**
   * Run BabelFish.
   *
   **/
  jQuery(function($){
    gotGreek.boot({
      source: request.srcLang,
      target: request.targetLang,
      engine: gotGreek.engines.googleTranslateFree,
      successCallback: extensionSuccessCallback,
      googleApiKey: request.googleApiKey,
      googleTranslateJsonp: false
    });
  });

});
