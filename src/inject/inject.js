chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // flag to designate type of message
  if (request.msgId != 'bootBabelFrog') {
    return;
  }

  /**
   * Run BabelFish.
   **/
  jQuery(function($){
    BabelFrog.setConfig(makeConfig(request.config));
    BabelFrog.boot();
  });

});

/*
 * Maps chrome extension config to BabelFrog config
 */
function makeConfig(config){

  // Override standardSuccesCallback to also play audio.
  var extensionSuccessCallback = function(translation, expanded) {
    BabelFrog.callbacks.standardSuccessCallback(translation, expanded);
    if (BabelFrog.config.vocalize) {
      console.log('sending message vocalize');
      // vocalize must be run from background.js
      chrome.runtime.sendMessage({msgId: "vocalize", text: BabelFrog.currentJob.text});
    }
  }
  var ret = {
    source: config.srcLang,
    target: config.targetLang,
    engine: BabelFrog.engines.googleTranslateFree, // TODO: make this an option in the UI
    successCallback: extensionSuccessCallback,
    googleApiKey: config.googleApiKey,
    googleTranslateJsonp: false,
    vocalize: config.vocalize
  }
  return ret;
}

/**
 * Listener for changes to BabelFrog config
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // flag to designate type of message
  if (request.msgId != 'reconfigBabelFrog') {
    return;
  }
  console.log("received message reconfigBabelFrog");
  BabelFrog.setConfig(makeConfig(request.config));
  sendResponse({});
});

/**
 * Listener to confirm that given tab has BabelFrog loaded.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.msgId == 'isBabelFrogLoaded') {
    sendResponse(true);
  }
});
