// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


/*
//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        // Execute some script when the page is fully (DOM) ready
        chrome.tabs.executeScript(null, {code:"console.log('hiiii');"});
    }
});

*/


chrome.browserAction.onClicked.addListener(function(tab) {
  var files = ["src/inject/jquery.min.js", "src/inject/rangy-core.js","src/inject/gotgreek.js", "src/inject/inject.js"]
  for (var i = 0; i < files.length; i++) {
    chrome.tabs.executeScript(tab.id, {file: files[i]});
  }
});
