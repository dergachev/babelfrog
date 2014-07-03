var ChromeBabelFrog = {};

ChromeBabelFrog.play = function(url) {
  if (typeof(ChromeBabelFrog.currentlyPlaying) !== "undefined") {
    ChromeBabelFrog.currentlyPlaying.pause();
  }
  ChromeBabelFrog.currentlyPlaying = new Audio(url);
  ChromeBabelFrog.currentlyPlaying.play();
}

ChromeBabelFrog.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

ChromeBabelFrog.setBadge = function(tabId) {
  chrome.browserAction.setBadgeText({
    text: ChromeBabelFrog.capitalize(settings.get('srcLang')),
    tabId: tabId
  });
}

var settings = new Store("settings", {
    "srcLang": "fr",
    "targetLang": "en",
    "engine": "google_free",
    "googleApiKey": "",
    "vocalize": true
});

ChromeBabelFrog.settings = function(settings){
  var ret = {
    srcLang: settings.get('srcLang'),
    targetLang: settings.get('targetLang'),
    googleApiKey: settings.get('googleApiKey'),
    vocalize: settings.get('vocalize')
  };
  return ret;
}

/**
 * Injects the BabelFrog content scripts into currently active tab.
 * Subsequet clicks will display the BabelFrog settings popup.
 *
 */
ChromeBabelFrog.activate = function(tab) {
  chrome.tabs.sendMessage(tab.id, { msgId: "isBabelFrogLoaded" }, function(result) {
    // not already loaded
    if (typeof(result) == "undefined") {

      ChromeBabelFrog.setBadge(tab.id);

      var files = ["src/inject/jquery.min.js", "src/inject/rangy-core.js","src/inject/babelfrog.js"];
      for (var i = 0; i < files.length; i++) {
        chrome.tabs.executeScript(tab.id, {file: files[i]});
      }
      chrome.tabs.insertCSS(tab.id, {file: "src/css/babelfrog.css"});
      chrome.tabs.executeScript(tab.id, {file: "src/inject/inject.js"}, function(){
        chrome.tabs.sendMessage(tab.id, {
          msgId: "bootBabelFrog",
          config: ChromeBabelFrog.settings(settings)
        });
      });
      // The initial click on the browserAction (BabelFrog icon) will activate it on the current tab.
      // Subsequet clicks will display the settings popup, which includes a CSS file to clean it up.
      chrome.browserAction.setPopup({
          tabId: tab.id,
          popup: 'src/options_custom/popup.html'
      });
    }
  });
};

chrome.browserAction.onClicked.addListener(ChromeBabelFrog.activate);

/**
 * Listens for vocalization requests from content scripts.
 * This must be done in background.js since otherwise html5 audio doesn't work cross-domain.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // flag to designate type of message
  if (request.msgId != 'vocalize') {
    return;
  }

  // Try to play the text (note that there's a 100 char limit; should
  // chunk on sentences.
  var text = encodeURIComponent(request.text);
  var url = 'http://translate.google.com/translate_tts?ie=UTF-8&tl='
            + settings.get('srcLang')
            + '&total=1&idx=0&textlen=77&client=t&prev=input&q='
            + text;
  console.log("vocalizing", url);
  ChromeBabelFrog.play(url);
});

/**
 * Listens for updates to BabelFrog settings and updates BabelFrog.config
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.msgId !== 'updatedSettingsBabelFrog') {
    return;
  }

  chrome.tabs.query({}, function(tabs) {
    for (var i = 0; i < tabs.length; i++) {
      var closure = function(id) {
        return function(response) {
          // update each BabelFrog tab's badge text to reflect new setting
          if (typeof(response) !== "undefined") {
            ChromeBabelFrog.setBadge(id);
          }
        }
      }
      chrome.tabs.sendMessage(tabs[i].id, {
        msgId: "reconfigBabelFrog",
        config: ChromeBabelFrog.settings(settings)
      }, closure(tabs[i].id));
    }
  });
});

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    title: "Translate with BabelFrog",
    "contexts": ["all"],
    "id": "BabelFrog"
  });

  // TODO: consider opening up the settings page on install
  // chrome.tabs.create({url: chrome.extension.getURL('src/options_custom/index.html')});

});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  ChromeBabelFrog.activate(tab);
});

