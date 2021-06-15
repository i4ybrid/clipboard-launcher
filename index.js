const ClipboardMonitor = require("./src/clipboard/clipboardMonitor");
const UrlFilter = require("./src/filter/urlFilter");
const ChromeLauncher = require("./src/launcher/chromeLauncher");

(async function () {
    let clipboardMonitorConfigs = {
        "filter": UrlFilter.checkUrl,
        "processor": ChromeLauncher.launchOnAllProfiles
    }    
    console.log("App Started...");
    ClipboardMonitor.startMonitoringLoop(clipboardMonitorConfigs);

})();