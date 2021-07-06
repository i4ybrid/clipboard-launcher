const POP3Client = require("poplib");
const serverInfo = require("../../config/mailServer.json");

async function checkEmail(email, password, callback) {
    let emailPullLoop = setInterval(() => {
        if (global.passwordResetDone[email] === false && global.canEnterResetCode[email] === false) {
            retrieveEmail(email, password, callback);
        }
        if (global.passwordResetDone[email] === true) {
            clearInterval(emailPullLoop);
        }
    }, 2000);
}

function retrieveEmail(email, password, callback) {
    let domain, client;
    if (email) {
        let emailSplit = email.split("@");
        if (emailSplit && emailSplit.length > 1) {
            domain = emailSplit[1];
        }
    }
    if (domain && serverInfo[domain]) {
        client = new POP3Client(
            serverInfo[domain].popPort,
            serverInfo[domain].popServer, {
                enabletls: ("TLS" === serverInfo[domain].popEncryption),
                debug: false,
                networkdebug: false
            });

        client.on("error", (err) => {
            console.log(err);
        });

        client.on("connect", () => {
            client.login(email, password);
        });

        client.on("invalid-state", (cmd) => {
            console.log("Invalid state. You tried calling " + cmd);
        });

        client.on("locked", (cmd) => {
            console.log("Current command has not finished yet. You tried calling " + cmd);
        });

        client.on("login", (status, rawdata) => {
            if (status) {
                //console.log("Logged into e-mail for " + email);
                client.list();
            } else {
                console.log("Login failed for " + email);
            }
        });

        client.on("list", (status, msgcount, msgnumber, data, rawdata) => {
            if (status === false) {
                console.log("LIST failed");
            } else {
                //console.log("LIST success with " + msgcount + " element(s)");
                if (msgcount > 0) {
                    client.retr(msgcount);
                }
            }
        });

        client.on("retr", (status, msgnumber, data, rawdata) => {
            if (status === true) {
                //console.log("RETR success for msgnumber " + msgnumber);
                callback(data);
                client.quit();
            } else {
                console.log("RETR failed for msgnumber " + msgnumber);
            }
        });

        client.on("dele", function(status, msgnumber, data, rawdata) {
            if (status === true) {
                console.log("DELE success for msgnumber " + msgnumber);
            } else {
                console.log("DELE failed for msgnumber " + msgnumber);
            }
        });

        client.on("quit", function(status, rawdata) {
            if (status === true) {
                //console.log("QUIT success");
            } else {
                console.log("QUIT failed");
            }
        });
    }

    return client;
}

module.exports = {
    "checkEmail": checkEmail
}