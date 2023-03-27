const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const { MessagingResponse } = require('twilio').twiml;

const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const minTime = 900 * 1000;//ms
    const { sendToNumber, message, sendDate } = req.body;

    const sendDateObj = sendDate ? new Date(sendDate) : new Date();
    if (!sendToNumber || !message || !(sendDateObj instanceof Date && !isNaN(sendDateObj))) return res.sendStatus(400);

    console.log(sendDateObj.getTime() - new Date().getTime())
    const isFuture = sendDateObj.getTime() - new Date().getTime() > minTime;
    console.log(isFuture)

    const body = isFuture ? {
      messagingServiceSid: process.env.TWILIO_SERVICE_SID,      
      to: sendToNumber ,
      body: message,  
      scheduleType: 'fixed',
      sendAt: sendDateObj.toISOString()
    }
    : {
      messagingServiceSid: process.env.TWILIO_SERVICE_SID,      
      to: sendToNumber ,
      body: message
    }

    const messageData = await client.messages 
      .create(body)
      // .then((message) => res.status(200).send(message).end())

    console.log(messageData.sid)
    res.status(200).send(messageData).end();
  } catch (err) {
    console.log(err)
    res.sendStatus(400)
  }
})

router.post('/reply', (req, res) => {

  const { ToCountry, ToState, SmsMessageSid, NumMedia, ToCity, FromZip, SmsSid, FromState, SmsStatus, FromCity, Body, FromCountry, To, MessagingServiceSid, ToZip, NumSegments, MessageSid, AccountSid, From, ApiVersion } = req.body;

  // const twiml = new MessagingResponse();
  // twiml.message('The Robots are coming! Head for the hills!');

  
  console.log(Body)
  // res.sendStatus(200);
  res.type('text/xml').status(200).send("");

})



module.exports = router;