const { ImapFlow } = require('imapflow');
const inspect = require("util").inspect;

const serverInfo = require("../../config/mailServer.json");

function instantiateClient(email, password) {
    let domain, client;
    if (email) {
        let emailSplit = email.split("@");
        if (emailSplit && emailSplit.length > 1) {
            domain = emailSplit[1];
        }
    }
    if (domain && serverInfo[domain]) {
        client = new ImapFlow({
            host: serverInfo[domain].imapServer,
            port: serverInfo[domain].imapPort,
            secure: ("TLS" === serverInfo[domain].imapEncryption),
            auth: {
                user: email,
                pass: password
            },
            emitLogs: false
        });
    }

    return client;
}

async function checkEmail(email, password, callback) {
    let client = instantiateClient(email, password);
    if (!client) {
        console.log("Couldn't instantiate IMAP Client");
        return;
    }
    await client.connect();

    let emailPullLoop = setInterval(async() => {
        let lock = await client.getMailboxLock('INBOX');
        try {
            retrieveEmail(client, callback);
            /*
            if (global.passwordResetDone[email] === false && global.canEnterResetCode[email] === false) {
                retrieveEmail(client, callback);
            }
            if (global.passwordResetDone[email] === true) {
                client.logout();
                clearInterval(emailPullLoop);
            }
            */
        } finally {
            lock.release();
        }
    }, 2000);
}

async function retrieveEmail(client, callback) {
    // fetch latest message source
    let message = await client.fetchOne('*', { source: true });
    console.log(message);

    // list subjects for all messages
    // uid value is always included in FETCH response, envelope strings are in unicode.
    /*for await (let message of client.fetch('*', { envelope: true })) {
        console.log(`${message.uid}: ${message.envelope.subject}`);
    }*/

}

const targetAccounts = require("../../config/targetAccounts.json");
checkEmail(targetAccounts[0].email, targetAccounts[0].emailPassword, null);

module.exports = {
    "checkEmail": checkEmail
}