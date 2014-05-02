chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // flag to designate type of message
  if (request.msgId != 'bootBabelFrog') {
    return;
  }


  /**
   * Run BabelFish.
   *
   **/
  jQuery(function($){
    gotGreek.setConfig(makeConfig(request.config));
    gotGreek.boot(); 
  });

});

/*
 * Maps chrome extension config to gotGreek config
 */
function makeConfig(config){

  // Override standardSuccesCallback to also play audio.
  var extensionSuccessCallback = function(translation) {
    gotGreek.callbacks.standardSuccessCallback(translation);
    if (gotGreek.config.vocalize) {
      console.log('sending message vocalize');
      // vocalize must be run from background.js
      chrome.runtime.sendMessage({msgId: "vocalize", text: gotGreek.currentJob.text});
    }
  }
  var ret = {
    source: config.srcLang,
    target: config.targetLang,
    engine: gotGreek.engines.googleTranslateFree, // TODO: make this an option in the UI
    successCallback: extensionSuccessCallback,
    googleApiKey: config.googleApiKey,
    googleTranslateJsonp: false,
    vocalize: config.vocalize
  }
  return ret;
}

/**
 * Listener for changes to gotGreek config
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // flag to designate type of message
  if (request.msgId != 'reconfigBabelFrog') {
    return;
  }
  console.log("received message reconfigBabelFrog");
  gotGreek.setConfig(makeConfig(request.config));
});
