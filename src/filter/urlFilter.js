let urlMatches = require("../../config/urlMatches.json");

/**
 * Check if the URL on the page matches
 * @param {string} possibleUrl 
 */
 function checkUrl(possibleUrl) {
    
    for (const [websiteType, regexMatcher] of Object.entries(urlMatches)) {
        let matchResult = possibleUrl.match(regexMatcher.regex);
        if (regexMatcher.enabled === true && (matchResult && matchResult[0])) {
            console.log("Found url [" + websiteType +"]: " + matchResult[0]);
            return matchResult[0];
        }
    }
}

module.exports = { 
    "checkUrl": checkUrl
}