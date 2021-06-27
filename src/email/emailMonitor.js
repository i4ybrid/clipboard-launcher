const POP3Client = require("poplib");
const serverInfo = require("../../config/mailServer.json");

const parsers = {"target": require("./parser/targetParser")};

function checkEmail(email, password, callback) {
    let domain;
    if (email) {
        let emailSplit = email.split("@");
        if (emailSplit && emailSplit.length > 1) {
            domain = emailSplit[1];
        }
    }
    
    if (domain && serverInfo[domain]) {
        let client = new POP3Client(
            serverInfo[domain].popPort,
            serverInfo[domain].popServer, {
                enabletls: ("TLS" === serverInfo[domain].popEncryption),
                debug: false
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
            console.log("Current command has not finished yet. You tried calling " + cmd);w
        });

        client.on("login", (status, rawdata) => {
            if (status) {
                console.log("Logged into e-mail for " + email);
                client.list();
            } else {
                console.log("Login failed for " + email);
                client.quit();
            }
        });

        client.on("list", (status, msgcount, msgnumber, data, rawdata) => {
            if (status === false) {
                console.log("LIST failed");
                client.quit();
            } else {
                //console.log("LIST success with " + msgcount + " element(s)");
                if (msgcount > 0) {
                    client.retr(msgcount);
                } else {
                    client.quit();
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
                client.quit();
            }
        });

        client.on("dele", function(status, msgnumber, data, rawdata) {
            if (status === true) {
                //console.log("DELE success for msgnumber " + msgnumber);
                client.quit();
            } else {
                console.log("DELE failed for msgnumber " + msgnumber);
                client.quit();
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
}

module.exports = {
    "checkEmail": checkEmail
}