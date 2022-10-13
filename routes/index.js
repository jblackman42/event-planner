const express = require('express');
const navigation = express.Router();
//authentication middleware
const {ensureAuthenticated, ensureAdminAuthenticated} = require('../middleware/auth.js')

//home page
navigation.get('/', ensureAuthenticated, (req, res) => {
  res.render('pages/calendar')
})
navigation.get('/calendar', ensureAuthenticated, (req, res) => {
  res.render('pages/calendar')
})
navigation.get('/login', (req, res) => {
  res.render('pages/login', {error: null})
})
navigation.get('/create', ensureAdminAuthenticated, (req, res) => {
  res.render('pages/create')
})

navigation.get('/health-assesment', ensureAuthenticated, (req, res) => {
  res.render('pages/health-assesment')
})

module.exports = navigation;