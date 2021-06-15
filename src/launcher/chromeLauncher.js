const ValidUrl = require('valid-url');
const open = require("open");

const profiles = require("../../config/profiles.json");

function launchOnAllProfiles(url) {
    if (ValidUrl.isUri(url)) {
        for (const [profileName, directory] of Object.entries(profiles)) {
            console.log("Launching [" + url + "] for profile: " + profileName)
            open(url, { app: { name: open.apps.chrome, arguments: ["--profile-directory=" + directory] } });
        }
    } else {
        console.log(url + " doesn't appear to be a valid URL");
    }
}

module.exports = {
    "launchOnAllProfiles": launchOnAllProfiles
}