const puppeteer = require("puppeteer");
const targetAccounts = require("../../config/targetAccounts.json");

const TARGET_URL = "https://target.com";
const SHOW_WINDOW = true;
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36";

function loadReset() {
    puppeteer
        .launch({
            headless: (SHOW_WINDOW !== true),
            ignoreDefaultArgs: ["--enable-automation"],
            trueignoreHTTPSErrors: true
        }).then(async (browser) => {

            let page = await browser.newPage();
            await page.setViewport({ width: 900, height: 900 });
            page.setUserAgent(USER_AGENT);
            await page.goto(TARGET_URL);
            await page.click("a#account");

            await page.waitForSelector("#accountNav-signIn > a > div", { timeout: 50000000 })
                .then(async (signIn) => {
                    console.log("Sign in button found");
                    let mouse = signIn._page._mouse;
                    console.log(mouse._x + " : " + mouse._y);
                    await delay(200);
                    clickOnElement(page, signIn);
                });

            await page.waitForSelector("#recoveryPassword", { timeout: 50000000 })
                .then(() => {
                    console.log("Found recovery link");
                    page.click("#recoveryPassword");
                });

            let forgotPasswordPageCheck = await setInterval(async () => {
                let h1Text = await page.evaluate(() => {
                    return document.querySelector("h1").textContent;
                })

                if ("Forgot Password" === h1Text.trim()) {
                    console.log("In forgot password page");
                    await page.waitForSelector("input#username")
                        .then(async (emailInput) => {
                            await clickOnElement(page, emailInput);
                            await emailInput.type(targetAccounts[0].email);
                            page.waitForSelector("button#continue")
                                .then((button) => { button.click(); });
                        });
                    clearInterval(forgotPasswordPageCheck);
                }
            }, 500);

            await page.waitForSelector("label[for='resetPassword']")
            .then(async (resetPasswordRadial) => {
                await resetPasswordRadial.click();
                page.waitForSelector("button#continue")
                    .then((button) => { button.click(); });
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
            console.log("error", "ERROR: " + error);
        });
}

/**
 * Move mouse and click on element's location
 * @param {*} page 
 * @param {*} elem 
 * @param {*} x 
 * @param {*} y 
 */
async function clickOnElement(page, elem, x = null, y = null) {
    const rect = await page.evaluate(el => {
        const { top, left, width, height } = el.getBoundingClientRect();
        return { top, left, width, height };
    }, elem);

    // Use given position or default to center
    const _x = x !== null ? x : rect.width / 2;
    const _y = y !== null ? y : rect.height / 2;

    console.log("Clicking on " + (rect.left + _x) + " : " + (rect.top + _y));
    await page.mouse.move(rect.left + _x, rect.top + _y);
    await page.mouse.click(rect.left + _x, rect.top + _y);
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

loadReset();