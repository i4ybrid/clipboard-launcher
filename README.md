# Clipboard Monitor
Tool to monitor clipboard and open certain URLs in chrome browsers under multiple profiles. Ideally, this is used in conjunction with tamper monkey scripts to automate checkout of certain products

## Installation instructions:

Clone this git codebase
Use the latest node version. This code was written with v14.16.1
Run `npm install`

## Configuration

### profile.json
To update profile.json, the key is any alias you want to use, and the value is the Chrome profile's folder
In each version of Chrome, visit: `chrome://version/`
Check the Profile Path's location. This instance of Chrome's profile is the folder at the very end. It could be Default or Profile 1

### urlMatches.json
This uses regular expression to match URLs that you will want to trigger browsers to open. If you don't know what regular expression is, just don't modify it
enabled will flip whether or not to launch browsers for this URL match

## Starting the script
Run `node index.js`


# Target Reset Password
This is still being worked on. This is the initial beta version. You can run this executing `node resetPasswords.js`

## Reset Password Configuration
Under config/targetAccounts.json, you will need to enter your information. While this is an array, the beta version only resets the first account in the configuration
```
[
    {
        "email": "emailAccount@hotmail.com",
        "emailPassword": "emailAccountsPassword",
        "newTargetPassword": "newPasswordToResetItTo"
    }
]
```

## Beta Notes
Because it's in beta, the window still opens and executes with you as the user. If something fails to work or click, manually click it. Please report any bugs to me.
The script only supports outlook, hotmail, gmail, yahoo, and aol currently. If there are other e-mails you want to use, let me know as well.