const open = require("open");
const clipboardy = require('clipboardy');
const validUrl = require('valid-url');
const profiles = require("./config/profiles.json");

let urlMatches = require("./config/urlMatches.json");
let lastString = "";

function launchOnAllProfiles(url) {
    if (validUrl.isUri(url)) {
        for (const [profileName, directory] of Object.entries(profiles)) {
            console.log("Launching [" + url + "] for profile: " + profileName)
            open(url, { app: { name: open.apps.chrome, arguments: ["--profile-directory=" + directory] } });
        }
    } else {
        console.log(url + " doesn't appear to be a valid URL");
    }
}

/**
 * Check if the URL on the page matches
 * @param {string} possibleUrl 
 */
function checkString(possibleUrl) {
    
    for (const [websiteType, regexMatcher] of Object.entries(urlMatches)) {
        let matchResult = possibleUrl.match(regexMatcher.regex);
        if (regexMatcher.enabled === true && (matchResult && matchResult[0])) {
            console.log("Found url [" + websiteType +"]: " + matchResult[0]);
            launchOnAllProfiles(matchResult[0]);
        }
    }
}

/**
 * Check the clipboard to see if something changed
 */
function checkClipboard() {
    let thisString = clipboardy.readSync();
    if (thisString && (typeof thisString === 'string' || thisString instanceof String)) {
        if (lastString !== thisString) {
            checkString(thisString);
            lastString = thisString;
        }
    }
}

//Start Loop
console.log("App Started...");
setInterval(() => {
    checkClipboard();
}, 500);

//launchOnAllProfiles("http://www.google.com");
