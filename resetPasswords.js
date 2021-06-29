const TargetReset = require("./src/resetPassword/targetTriggerReset");
const emailMonitor = require("./src/email/emailMonitor");
const targetParser = require("./src/email/parser/targetParser");

function execute() {
    TargetReset.instantiate();
    //let resetPromise = TargetReset.loadReset();

    let targetAccounts = require("./config/targetAccounts.json");
    emailMonitor.checkEmail(targetAccounts[4].email, targetAccounts[4].emailPassword, targetParser.parse);
}

execute();

