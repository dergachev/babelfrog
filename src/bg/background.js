var activeTabs = [];

var settings = new Store("settings", {
    "srcLang": "fr",
    "targetLang": "en",
    "engine": "google_free",
    "googleApiKey": "",
    "vocalize": true
});

function gotGreekSettings(settings){
  var ret = {
    srcLang: settings.get('srcLang'),
    targetLang: settings.get('targetLang'),
    googleApiKey: settings.get('googleApiKey'),
    vocalize: settings.get('vocalize')
  };
  return ret;
}

/**
 * Injects the BabelFrog content scripts into currently active webpage.
 * Subsequet clicks will display the BabelFrog settings popup.
 *
 */
chrome.browserAction.onClicked.addListener(function(tab) {
  var files = ["src/inject/jquery.min.js", "src/inject/rangy-core.js","src/inject/gotgreek.js"];
  for (var i = 0; i < files.length; i++) {
    chrome.tabs.executeScript(tab.id, {file: files[i]});
  }
  chrome.tabs.executeScript(tab.id, {file: "src/inject/inject.js"}, function(){
    chrome.tabs.sendMessage(tab.id, {
      msgId: "bootBabelFrog",
      config: gotGreekSettings(settings)
    });
  });

  // The initial click on the browserAction (BabelFrog icon) will activate it on the current tab.
  // Subsequet clicks will display the settings popup, which includes a CSS file to clean it up.
  chrome.browserAction.setPopup({
      tabId: tab.id,
      popup: 'src/options_custom/popup.html'
  });
  activeTabs.push(tab.id);
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
  var url = 'http://translate.google.com/translate_tts?ie=UTF-8&tl='
            + settings.get('srcLang')
            + '&total=1&idx=0&textlen=77&client=t&prev=input&q='
            + text;
  console.log("vocalizing", url);
  var audio = new Audio(url);
  audio.play();
});

/**
 * Listens for updates to BabelFrog settings and updates gotGreek.config
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.msgId !== 'updatedSettingsBabelFrog') {
    return;
  }
  for (var i = 0; i < activeTabs.length; i++) {
    chrome.tabs.sendMessage(activeTabs[i], {
      msgId: "reconfigBabelFrog",
      config: gotGreekSettings(settings)
    });
  }
});
