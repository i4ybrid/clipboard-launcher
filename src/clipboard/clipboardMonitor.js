const clipboardy = require('clipboardy');
const clipboardListener = require('clipboard-event');
let lastString = "";

/**
 * Check the clipboard to see if something changed
 * @param {Object} configs
 */
function startMonitoringLoop(configs) {

    //Start Loop
    setInterval(() => {
        try {
            let thisString;
            try {
                thisString = clipboardy.readSync();
            } catch (err) {
                //no-op
            }
            if (thisString && (typeof thisString === 'string' || thisString instanceof String) && lastString !== thisString) {
                let filterResult = configs.filter(thisString);
                if (filterResult) {
                    configs.processor(thisString);
                }
                lastString = thisString;
            }
        } catch (e) {
            console.log("Caught error, ignoring copied data", e);
        }
    }, 500);
}

module.exports = {
    "startMonitoringLoop": startMonitoringLoop
}

//launchOnAllProfiles("http://www.google.com");
