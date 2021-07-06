const puppeteer = require("puppeteer");
const targetAccounts = require("../../config/targetAccounts.json");
const targetParser = require("../email/parser/targetParser");
const emailMonitor = require("../email/emailMonitor");
const { clickOnElement, delay } = require("../util/puppeteerHelper");
const events = require("events");

const TARGET_URL = "https://target.com";
const SHOW_WINDOW = true;
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36";

function instantiate() {
    global.startTime = Date.now();
    if (!global.em) {
        global.em = new events.EventEmitter();
    }
    if (!global.canEnterResetCode) {
        global.canEnterResetCode = {};
    }
    if (!global.targetEmails) {
        global.targetEmails = {};
    }
    if (!global.pages) {
        global.pages = {};
    }
    if (!global.browsers) {
        global.browsers = {};
    }
    if (!global.passwordResetDone) {
        global.passwordResetDone = {};
    }
}

function loadReset() {
    instantiate();
    let puppeteerPromises = [];

    targetAccounts.forEach((targetAccount) => {
        if (targetAccount.email) {
            global.targetEmails[targetAccount.email] = targetAccount;
            global.canEnterResetCode[targetAccount.email] = false;
            global.passwordResetDone[targetAccount.email] = false;

            puppeteerPromises.push(invokeResetPasswordEmail(targetAccount));
        }
    })
}

async function invokeResetPasswordEmail(targetAccount) {
    return puppeteer
        .launch({
            headless: (SHOW_WINDOW !== true),
            ignoreDefaultArgs: ["--enable-automation", "--disable-infobars"],
            trueignoreHTTPSErrors: true
        }).then(async(browser) => {
            let page = await browser.newPage();
            global.pages[targetAccount.email] = page;
            global.browsers[targetAccount.email] = browser;

            await page.setViewport({ width: 900, height: 900 });
            page.setUserAgent(USER_AGENT);
            await page.goto(TARGET_URL);
            await page.click("a#account");
            let emailAddress = targetAccount.email;

            await page.waitForSelector("#accountNav-signIn > a > div", { timeout: 50000000 })
                .then(async(signIn) => {
                    console.log("Sign in button found");
                    let mouse = signIn._page._mouse;
                    console.log(mouse._x + " : " + mouse._y);
                    await delay(1000);
                    clickOnElement(page, signIn);
                });

            await page.waitForSelector("#recoveryPassword", { timeout: 50000000 })
                .then(() => {
                    console.log("Found recovery link");
                    page.click("#recoveryPassword");
                });

            await page.waitForSelector("h1", { timeout: 50000000 })
                .then(async() => {
                    console.log("In forgot password page");
                    await page.waitForSelector("input#username")
                        .then(async(emailInput) => {
                            await clickOnElement(page, emailInput);
                            await emailInput.type(targetAccount.email);
                            page.click("button#continue");
                        });
                });

            await page.waitForSelector("label[for='resetPassword']")
                .then(async(resetPasswordRadial) => {
                    await resetPasswordRadial.click();
                    page.waitForSelector("button#continue")
                        .then((button) => {
                            button.click();
                            global.canEnterResetCode[emailAddress] = true;
                            emailMonitor.checkEmail(targetAccount.email, targetAccount.emailPassword, targetParser.parse);
                        });
                });

            browser.on('disconnected', () => {
                if (global.discordClient) {
                    global.logger.log("info", "Detected Chromium was closed. Exiting");
                    try {
                        global.discordClient.destroy();
                    } catch (e) {
                        process.exit(1);
                    }
                }
            });
        })
        .catch((error) => {
            console.log("error", "ERROR: " + error.stack);
        });
}

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
                .then(async(codeInput) => {
                    console.log("Entering reset code for [" + emailAddress + "]: " + resetCode);
                    await codeInput.type(resetCode);
                    //await codeInput.type("11223344");
                    page.waitForSelector("button#verify", { timeout: 2000 })
                        .then(async(verifyButton) => {
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
            .then(async(passwordInput) => {
                await passwordInput.type(emailInfo.newTargetPassword);
                page.waitForSelector("button#submit", { timeout: 2000 })
                    .then(async(createPasswordButton) => {
                        await delay(800);
                        createPasswordButton.click();
                    }).then(async() => {
                        await page.waitForSelector("span[data-test='accountUserName']")
                            .then((accountNameSpan) => {
                                if (accountNameSpan && "Sign in" === accountNameSpan.innerText) {
                                    console.log("ERROR!! It looks like password reset was unsuccessful. " + emailAddress + "'s password may not have been set to " + emailInfor.newTargetPassword);
                                } else {
                                    global.passwordResetDone[emailAddress] = true;
                                    console.log("Password for [" + emailAddress + "] was reset to " + emailInfo.newTargetPassword);
                                }
                            })
                    });
            });
    }
}

module.exports = {
    "inputResetCode": inputResetCode,
    "loadReset": loadReset,
    "instantiate": instantiate
}