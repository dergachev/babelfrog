var settings = new Store("settings", {
    "srcLang": "fr",
    "targetLang": "en",
    "googleApiKey": ""
});

/**
 * Injects the BabelFrog content scripts into currently active webpage.
 */
chrome.browserAction.onClicked.addListener(function(tab) {
  var files = ["src/inject/jquery.min.js", "src/inject/rangy-core.js","src/inject/gotgreek.js"];
  for (var i = 0; i < files.length; i++) {
    chrome.tabs.executeScript(tab.id, {file: files[i]});
  }
  chrome.tabs.executeScript(tab.id, {file: "src/inject/inject.js"}, function(){
    chrome.tabs.sendMessage(tab.id, {
      msgId: "bootBabelFrog",
      srcLang: settings.get('srcLang'),
      targetLang: settings.get('targetLang'),
      googleApiKey: settings.get('googleApiKey'),
      vocalize: settings.get('vocalize')
    });
  });
});

/**
 * Listens for vocalization requests from content scripts.
 * This must be done in background.js since otherwise html5 audio doesn't work cross-domain.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // flag to designate type of message
  if (request.msgId != 'vocalize') {
    return;
  }

  // try to play the text
  var text = encodeURIComponent(request.text);
  var audio = new Audio('http://translate.google.com/translate_tts?ie=UTF-8&tl=fr&total=1&idx=0&textlen=77&client=t&prev=input&q=' + text);
  audio.play();
});
