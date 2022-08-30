const express = require('express');
const navigation = express.Router();
//authentication middleware

//home page
navigation.get('/', (req, res) => {
  res.render('pages/index')
})
navigation.get('/calendar', (req, res) => {
  res.render('pages/calendar')
})
navigation.get('/login', (req, res) => {
  res.render('pages/login', {error: null})
})
navigation.get('/loading', (req, res) => {
  res.render('pages/loading')
})

module.exports = navigation;