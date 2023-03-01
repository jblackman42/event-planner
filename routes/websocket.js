const express = require('express');
const router = express.Router();

const clients = [];

router.ws('/', function(ws, req) {
  clients.push(ws)
  console.log('new client connected');
})

router.get('/', (req, res) => {
  
  try {
    clients.forEach(clientWs => {
      clientWs.send('update')
    })

    res.sendStatus(200);
  } catch (err) {
    res.status(500).send('something went wrong').end();
  }
})

module.exports = router;