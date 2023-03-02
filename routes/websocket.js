const express = require('express');
const router = express.Router();

let clients = [];

router.ws('/', function(ws, req) {
  ws.id = Math.floor(Math.random() * Date.now()).toString(16)
  clients.push(ws)
  console.log('new client connected');

  ws.on('message', () => {
    console.log('message received');
  })

  ws.on('close', () => {
    console.log('websocket closed')
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