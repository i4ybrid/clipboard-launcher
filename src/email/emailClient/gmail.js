const outlook = require("node-outlook");

outlook.base.setApiEndpoint("https://outlook.office.com/api/v2.0");
outlook.base.setAnchorMailbox(email);