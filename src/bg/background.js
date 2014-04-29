// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

var settings = new Store("settings", {
    "srcLang": "fr",
    "targetLang": "en",
    "googleApiKey": "AIzaSyAICISSmAHfsclKJ4eu5UtbhhtWMLUqxcY"
});

chrome.browserAction.onClicked.addListener(function(tab) {
  var files = ["src/inject/jquery.min.js", "src/inject/rangy-core.js","src/inject/gotgreek.js"];
  for (var i = 0; i < files.length; i++) {
    chrome.tabs.executeScript(tab.id, {file: files[i]});
  }
  chrome.tabs.executeScript(tab.id, {file: "src/inject/inject.js"}, function(){
    chrome.tabs.sendMessage(tab.id, {
      msgId: "bootBabelFrog",
      srcLang: settings.get('srcLang'),
      targetLang: settings.get('targetLang')
    });
  });
});
