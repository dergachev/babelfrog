chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // flag to designate type of message
  if (request.msgId != 'bootBabelFrog') {
    return;
  }

  var googleTranslateAJAX = function(sourceText, config, successCallback, errorCallback) {
    console.log(config, 'ajax config');
    jQuery.ajax({
      url:'https://www.googleapis.com/language/translate/v2',
      type: 'GET',
      success: function(response){
        if (response.data && response.data.translations) {
          successCallback(response.data.translations[0].translatedText);
          return;
        }

        // Google Translate reports 200 in case of error messages
        if (response.error){
          errorCallback('Google Translate Error ' + response.error.code + ': <br/>' + response.error.message);
        }
        else {
          errorCallback('Google Translate: Uknown problem');
        }
      },
      error: function(xhr, status){
        errorCallback("Google Translate XHR error: <br/>"  + status);
      },
      data: {
        key: config.googleApiKey,
        source: config.source,
        target: config.target,
        q: sourceText,
      }
    });
  }

  jQuery(function($){
    gotGreek.boot({source: request.srcLang, target: request.targetLang, performRequest: googleTranslateAJAX, googleApiKey: request.googleApiKey});
  });

});
