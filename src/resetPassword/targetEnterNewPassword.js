const { delay } = require("../util/puppeteerHelper");

/**
 * Loops logic to check if we can reset the code. When we determine it's possible, then move on
 * 
 * @param {*} resetCode 
 * @param {*} emailAddress 
 */
 function inputResetCode(resetCode, emailAddress) {
    let checkEmailLoop = setInterval(() => {
        if (!global.pages || !global.canEnterResetCode) {
            console.log("Seems like initialize wasn't invoked, are you sure you started from resetPasswords.js?");
            return;
        }
        let page = global.pages[emailAddress];
        let canEnterResetCode = global.canEnterResetCode[emailAddress];
        if (page && canEnterResetCode === true) {
            console.log("Entering reset code for [" + emailAddress + "]: " + resetCode);
            clearInterval(checkEmailLoop);
            page.waitForSelector("input[placeholder='Enter your code']", { timeout: 50000000 })
            .then(async (codeInput) => {
                await codeInput.type(resetCode);
                page.waitForSelector("button#verify", { timeout: 2000 })
                .then(async (verifyButton) => {
                    verifyButton.click();
                });
            }).then(() => {
                enterNewPassword(emailAddress);
            });
        }
    }, 500);
}

function enterNewPassword(emailAddress) {
    let page = global.pages[emailAddress];
    let emailInfo = global.targetEmails[emailAddress];
    if (!emailInfo || !emailInfo.newTargetPassword) {
        console.log("Error! You didn't set a new password! Enter one manually.");
    } else {
        page.waitForSelector("input#password", { timeout: 50000000 })
        .then(async (passwordInput) => {
            await passwordInput.type(emailInfo.newTargetPassword);
            page.waitForSelector("button#submit", { timeout: 2000 })
            .then(async (createPasswordButton) => {
                await delay(800);
                createPasswordButton.click();
            }).then(() => {
                console.log("Password for [" + emailAddress + "] was reset to " + emailInfo.newTargetPassword);
            });
        });
    }
}

module.exports = {
    "inputResetCode": inputResetCode
}