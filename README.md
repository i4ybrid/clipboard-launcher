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

## FAQ

### My e-mail isn't being checked.
You must enable POP

## Configuring Gmail
Google goes through an API instead of POP3. There's quite a bit of setup you will need to do to get gmail going.
Follow the steps for Get gmail API credentials here, except instead of setting the application to other, just select Desktop: https://github.com/ismail-codinglab/gmail-inbox#get-gmail-api-credentials 

Download the credentials, which is a json file, and add it to that user's data under targetAccounts.json that should look like:
```
    {
        "email": "emailAddress@gmail.com",
        "emailPassword": "passwordThatCanBeIgnored", 
        "newTargetPassword": "newTargetPasswordHere1",
        "gmailAuthData": {
            "installed": {
                "client_id": "????????????????????????.apps.googleusercontent.com",
                "project_id": "?????????????????",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_secret": "???????????????",
                "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]
            }
        }
    }
```