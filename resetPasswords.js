const TargetReset = require("./src/resetPassword/targetTriggerReset");
const emailMonitor = require("./src/email/emailMonitor");
const targetParser = require("./src/email/parser/targetParser");

function execute() {
    let resetPromise = TargetReset.loadReset();

    //let targetAccounts = require("./config/targetAccounts.json");
    //emailMonitor.checkEmail(targetAccounts[0].email, targetAccounts[0].emailPassword, targetParser.parse);
}

execute();

