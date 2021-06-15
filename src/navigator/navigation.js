const CONFIG = {
    "delay": 200
}

async function clickElementLocation(page, selectorString) {
    if (!page) {
        console.log("Error! page not instantiated");
    } else {
        page.waitForSelector(selectorString, { timeout: 50000000 })
        .then(async (element) => {
            console.log(selectorString + " was found!");
            let mouse = element._page._mouse;
            //console.log(mouse._x + " : " + mouse._y);
            await delay(CONFIG.delay);
            clickOnElement(page, element);
        });
    }
}

module.exports = {
    "clickElementLocation": clickElementLocation
};