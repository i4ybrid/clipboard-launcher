const mailClient = require("node-mail-client");
const serverInfo = require("../../config/mailServer.json");

function checkEmail(email, password, parser) {
    let domain;
    if (email) {
        let emailSplit = email.split("@");
        if (emailSplit && emailSplit.length > 1) {
            domain = emailSplit[1];
        }
    }
    if (domain && serverInfo[domain]) {
        let mail = new mailClient({
            user: email,
            pass: password,
            
        });
    }
    
}

module.exports = {
    "checkEmail": checkEmail
}