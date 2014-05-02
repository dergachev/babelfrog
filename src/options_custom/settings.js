window.addEvent("domready", function () {
  new FancySettings.initWithManifest(function (settings) {
    for(var el in settings.manifest){
      // ensure that any settings change detected will notify background.js
      settings.manifest[el].addEvent("action", function(){
        console.log("Sending message updatedSettingsBabelFrog");
        chrome.runtime.sendMessage({
          msgId: "updatedSettingsBabelFrog",
        });
      });
    };
  });
});
