const puppeteer = require("puppeteer");
const targetAccounts = require("../../config/targetAccounts.json");
const targetParser = require("../email/parser/targetParser");
const emailMonitor = require("../email/emailMonitor");
const events = require("events");
const { clickOnElement, delay } = require("../util/puppeteerHelper");

const TARGET_URL = "https://target.com";
const SHOW_WINDOW = true;
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36";

function instantiate() {
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
    if (!global.passwordResetDone) {
        global.passwordResetDone = {};
    }
    if (!global.em) {
        global.em = new events.EventEmitter();
        addEventListeners(global.em);
    }
}

function addEventListeners(em) {
    em.addListener("receivedResetCode", (data) => {
        console.log("Received Reset Code: " + JSON.stringify(data));
    });
}

function loadReset() {
    instantiate();
    let puppeteerPromises = [];

    targetAccounts.forEach((targetAccount) => {
        if (targetAccount.email) {
            global.targetEmails[targetAccount.email] = targetAccount;
            global.canEnterResetCode[targetAccount.email] = false;
            global.passwordResetDone[targetAccount.email] = false;

            let puppeteerPromise = createPuppeteer();
            puppeteerPromises.push(puppeteerPromise);
            executeForgotPassword(puppeteerPromise, targetAccount);
        }
    })
}

function createPuppeteer() {
    return puppeteer
        .launch({
            headless: (SHOW_WINDOW !== true),
            ignoreDefaultArgs: ["--enable-automation", "--disable-infobars"],
            trueignoreHTTPSErrors: true
        }).catch((error) => {
            console.log("error", "ERROR: " + error.stack);
        });
}

function executeForgotPassword(puppeteerPromise, targetAccount) {
    puppeteerPromise
        .then(async (browser) => {
            let page = await browser.newPage();
            global.pages[targetAccount.email] = page;
            global.browsers[targetAccount.email] = browser;

            await page.setViewport({ width: 900, height: 900 });
            page.setUserAgent(USER_AGENT);
            await page.goto(TARGET_URL);
            await page.click("a#account");
            let emailAddress = targetAccount.email;

            await page.waitForSelector("#accountNav-signIn > a > div", { timeout: 50000000 })
                .then(async (signIn) => {
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
                .then(async () => {
                    console.log("In forgot password page");
                    await page.waitForSelector("input#username")
                        .then(async (emailInput) => {
                            await clickOnElement(page, emailInput);
                            await emailInput.type(targetAccount.email);
                            page.click("button#continue");
                        });
                });

            await page.waitForSelector("label[for='resetPassword']")
                .then(async (resetPasswordRadial) => {
                    await resetPasswordRadial.click();
                    page.waitForSelector("button#continue")
                        .then((button) => {
                            button.click();
                            global.canEnterResetCode[emailAddress] = true;
                            emailMonitor.checkEmail(targetAccount.email, targetAccount.emailPassword, targetParser.parse);
                        });
                });

            browser.on('disconnected', () => {
                console.log("Chrome Closed.");
            });
        });
}

module.exports = {
    "loadReset": loadReset,
    "instantiate": instantiate
};
