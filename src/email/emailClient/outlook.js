const POP3Client = require("poplib");
const serverInfos = require("../../../config/mailServer.json");

function execute() {
    let serverInfo = serverInfos["outlook.com"];


    let client = new POP3Client(serverInfo.popPort, serverInfo.popServer, {
        enabletls: true
    });
    client.on("connect", () => {
        console.log("Connected!");
        client.login("cryogenicsleep@hotmail.com", "c4rsAreW@ste");
        console.log(client.list(2));
    });

    client.on("error", (err) => {
        if (err.errno === 111) console.log("Unable to connect to server");
        else console.log("Server error occurred");

        console.log(err);
    });
}

execute();