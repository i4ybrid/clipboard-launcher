const simpleParser = require("mailparser").simpleParser;

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

    if (fromExists && subjectExists) {
        let fromAddress = parsedData.from.value[0].address;
        let subject = parsedData.subject;
        console.log("Found e-mail from: " + fromAddress + "; titled: " + subject);
        if ("orders@oe.target.com" === fromAddress && subject.startsWith("Your Target.com password reset code is ")) {
            let codeMatch = subject.match(/[0-9]{6}/);
            if (codeMatch && codeMatch.length > 0) {
                resetCode = codeMatch[0];
            }
        }
    }

    if (resetCode) {
        console.log("Found matching code!! " + resetCode);
        return resetCode;
    }
}

module.exports = {
    "parse": parse
};
