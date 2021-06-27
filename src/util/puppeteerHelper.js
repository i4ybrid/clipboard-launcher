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

    // Use given position or default to centerw
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


module.exports = {
    "clickOnElement": clickOnElement,
    "delay": delay
}