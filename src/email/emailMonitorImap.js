const Imap = require("node-imap");
const inspect = require("util").inspect;

const serverInfo = require("../../config/mailServer.json");

function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
}

function instantiateClient(email, password) {
    let domain, client;
    if (email) {
        let emailSplit = email.split("@");
        if (emailSplit && emailSplit.length > 1) {
            domain = emailSplit[1];
        }
    }
    if (domain && serverInfo[domain]) {
        client = new Imap({
            user: email,
            password: password,
            host: serverInfo[domain].imapServer,
            port: serverInfo[domain].imapPort,
            tls: ("TLS" === serverInfo[domain].imapEncryption)
        });
    }
    return client;
}

async function checkEmail(email, password, callback) {
    let imap = instantiateClient(email, password);
    if (!imap) {
        console.log("Couldn't instantiate IMAP Client");
        return;
    }

    /*
    let emailPullLoop = setInterval(() => {
        if (global.passwordResetDone[email] === false && global.canEnterResetCode[email] === false) {
            retrieveEmail(client, callback);
        }
        if (global.passwordResetDone[email] === true) {
            clearInterval(emailPullLoop);
        }
    }, 2000);
    */

    imap.once('ready', function() {
        imap.openBox('INBOX', true, function(err, box) {
            if (err) throw err;
            var f = imap.seq.fetch(box.messages.total + ':*', {
                bodies: ['TEXT'],
                struct: true
            });
            f.on('message', function(msg, seqno) {
                console.log('Message #%d', seqno);
                var prefix = '(#' + seqno + ') ';
                msg.on('body', function(stream, info) {
                    var buffer = '';
                    stream.on('data', function(chunk) {
                        buffer += chunk.toString('utf8');
                    });
                    stream.once('end', function() {
                        //console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
                        console.log(prefix + 'Parsed body: %s', inspect(Imap.parseHeader(buffer)));
                    });
                });
                msg.once('attributes', function(attrs) {
                    //console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
                });
                msg.once('end', function() {
                    console.log(prefix + 'Finished');
                });
            });
            f.once('error', function(err) {
                console.log('Fetch error: ' + err);
            });
            f.once('end', function() {
                console.log('Done fetching all messages!');
                imap.end();
            });
        });
    });

    imap.once('error', function(err) {
        console.log(err);
    });

    imap.once('end', function() {
        console.log('Connection ended');
    });

    imap.connect();
}

const targetAccounts = require("../../config/targetAccounts.json");
checkEmail(targetAccounts[0].email, targetAccounts[0].emailPassword, null);

module.exports = {
    "checkEmail": checkEmail
}