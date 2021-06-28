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
            page.waitForSelector("input[placeholder='Enter your code']", { timeout: 50000000 })
            .then(async (codeInput) => {
                console.log("Entering reset code for [" + emailAddress + "]: " + resetCode);
                await codeInput.type(resetCode);
                //await codeInput.type("11223344");
                page.waitForSelector("button#verify", { timeout: 2000 })
                .then(async (verifyButton) => {
                    verifyButton.click();
                });
            }).then(() => {
                page.waitForSelector("div[data-test='authAlertDisplay']", { timeout: 50000000 })
                .then((alertDiv) => {
                    if (alertDiv && alertDiv.innerText && alertDiv.innerText.indexOf("That code is invalid") >= 0) {
                        console.log("Code was invalid. Either wait or type it in manually");
                    }
                }).catch((err) => {
                    //no-op for timeouts
                });
                page.waitForSelector("input#password", { timeout: 50000000 })
                .then(() => {
                    //End loop, it means we found a good cod
                    clearInterval(checkEmailLoop);
                    enterNewPassword(emailAddress);
                })
            });
        }
    }, 500);
}

function enterNewPassword(emailAddress) {
    let page = global.pages[emailAddress];
    let browser = global.browsers[emailAddress];
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
            }).then(async () => {
                await page.waitForSelector("span[data-test='accountUserName']")
                .then((accountNameSpan) => {
                    if (accountNameSpan && "Sign in" === accountNameSpan.innerText) {
                        console.log("ERROR!! It looks like password reset was unsuccessful. " + emailAddress + "'s password may not have been set to " + emailInfor.newTargetPassword);
                    } else {
                        console.log("Password for [" + emailAddress + "] was reset to " + emailInfo.newTargetPassword);
                    }
                })
            });
        });
    }
}

module.exports = {
    "inputResetCode": inputResetCode
}