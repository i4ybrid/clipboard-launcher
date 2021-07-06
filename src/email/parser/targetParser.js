const simpleParser = require("mailparser").simpleParser;
const targetReset = require("../../resetPassword/targetEnterNewPassword");

function parse(data) {
    if (data) {
        let options = {
            skipImageLinks: true,
            skipTextLinks: true,
        };
        simpleParser(data, options)
            .then((parsed) => {
                //console.log(JSON.stringify(parsed));
                handleParsedData(parsed);
            }).catch((err) => {
                console.log("ERROR!", err);
            })
    }
}

function handleParsedData(parsedData) {
    let fromExists = parsedData && parsedData.from && parsedData.from.value && parsedData.from.value.length > 0 && parsedData.from.value[0];
    let subjectExists = parsedData && parsedData.subject;
    let resetCode;
    let toAddresses = [];

    if (fromExists && subjectExists) {
        let fromAddress = parsedData.from.value[0].address;
        let subject = parsedData.subject;
        let parsedTos = (parsedData.to && parsedData.to.value && parsedData.to.value.length > 0) ? parsedData.to.value : [];
        parsedTos.forEach((to) => {
            if (to && to.address) {
                toAddresses.push(to.address);
            }
        });

        console.log("Found e-mail from: " + fromAddress + "; titled: " + subject);
        if ("orders@oe.target.com" === fromAddress && subject.startsWith("Your Target.com password reset code is ")) {
            let codeMatch = subject.match(/[0-9]{6}/);
            if (codeMatch && codeMatch.length > 0) {
                resetCode = codeMatch[0];
            }
        }
    }

    if (resetCode && toAddresses && toAddresses.length > 0) {
        console.log("Found matching code!! " + resetCode);
        global.canEnterResetCode[emailAddress] = true;
        toAddresses.forEach((toAddress) => {
            //TODO Fire event instead of invoking it direc
            targetReset.inputResetCode(resetCode, toAddress);
            console.log("Resetting: [" + toAddress + "] with code = " + resetCode);
        });
        return resetCode;
    }
}

module.exports = {
    "parse": parse
};