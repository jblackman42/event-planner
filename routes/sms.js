const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const { MessagingResponse } = require('twilio').twiml;

const express = require('express');
const router = express.Router();

const clients = [];
const messages = [];
const numbers = [];

router.ws('/echo', (ws, req) => {
  clients.push(ws)
  console.log('new client connected')

  messages.forEach(msg => {
    ws.send(msg)
  })

  ws.on('message', function(msg) {
    messages.push(msg)
    // console.log(`message received: ${msg}`)
    clients.forEach(clientWs => {
      clientWs.send(msg)
    })

    const msgData = JSON.parse(msg)
    for (const number of numbers) {

      client.messages 
        .create({
          messagingServiceSid: process.env.TWILIO_SERVICE_SID,      
          to: number,
          body: msgData.message
        })
        // .then(message => console.log(message.sid))
    }
  })
})

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
      to: sendToNumber,
      body: message
    }

    console.log(body)

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

  if (!numbers.includes(From)) numbers.push(From);

  if (Body.toLowerCase() == 'stop') {
    console.log('stop')
    numbers.splice(numbers.indexOf(From), 1);
    console.log(numbers)
    
    // return res.type('text/xml').status(200).send("");
  }

  const msg = {
    "message": Body,
    "name": From,
    "timestamp": new Date().toLocaleTimeString()
  }

  messages.push(JSON.stringify(msg))
  console.log(messages)
  clients.forEach(clientWs => {
    clientWs.send(JSON.stringify(msg))
  })
  // res.sendStatus(200);
  res.type('text/xml').status(200).send("");

})



module.exports = router;