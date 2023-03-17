const express = require('express');
const router = express.Router();
const schedule = require('node-schedule');
const cron = require('node-cron');

let clients = [];

const refreshAll = () => {
  console.log('schedule run')
  clients.forEach(client => {
    client.send('update');
  })
}

// 11:59 PM daily
// cron.schedule('59 23 * * *', () => refreshAll());

// // 8:10 AM daily
// cron.schedule('10 8 * * *', () => refreshAll())


router.ws('/', function(ws, req) {
  ws.id = Math.floor(Math.random() * Date.now()).toString(16)
  clients.push(ws)
  console.log('new client connected');

  

  ws.on('message', () => {
    console.log('message received');
  })

  ws.on('close', (code, reason) => {
    console.log('websocket closed')
    console.log(reason)
    clients = clients.filter(client => client.id !== ws.id)
  })
})

router.get('/', (req, res) => {
  
  try {
    const { msg } = req.query;
    if (!msg) return res.status(400).send('missing parameters').end();

    clients.forEach(clientWs => {
      clientWs.send(msg)
    })
    console.log(`sent ${clients.length} updates`)

    res.status(200).send(`sent ${clients.length} updates`).end();
  } catch (err) {
    res.status(500).send('something went wrong').end();
  }
})

module.exports = router;