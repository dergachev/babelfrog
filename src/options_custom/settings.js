window.addEvent("domready", function () {
  new FancySettings.initWithManifest(function (settings) {
    for(var el in settings.manifest){
      // ensure that any settings change detected will notify background.js
      settings.manifest[el].addEvent("action", function(){
        chrome.runtime.sendMessage({
          msgId: "updatedSettingsBabelFrog",
        });
      });
    };
  });
});
