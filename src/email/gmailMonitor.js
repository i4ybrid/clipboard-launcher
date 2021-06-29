import { Inbox } from 'gmail-inbox';

async function exeCuteMe(){
  let inbox = new Inbox('credentials.json');
  await inbox.authenticateAccount(); // logs user in
  
  let messages = await inbox.getLatestMessages();

  console.log("my inbox messages", JSON.stringify(messages,null,4));
  
  // Note: give  https://github.com/ismail-codinglab/gmail-inbox a star if it saved you time!
}

exeCuteMe();

//TODO download code for sample from: https://github.com/ismail-codinglab/gmail-inbox#get-gmail-api-credentials