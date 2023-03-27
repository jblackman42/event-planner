const express = require('express');
const navigation = express.Router();

//authentication middleware
const { ensureAuthenticated, checkUserGroups, checkAdminUserGroups } = require('../middleware/auth.js')

navigation.get('/help', (req, res) => {
  res.render('pages/help')
})
//home page
navigation.get('/', ensureAuthenticated, checkUserGroups, (req, res) => {
  res.render('pages/calendar')
})
navigation.get('/calendar', ensureAuthenticated, checkUserGroups, (req, res) => {
  res.render('pages/calendar')
})
navigation.get('/my-tasks', ensureAuthenticated, checkUserGroups, (req, res) => {
  res.render('pages/my-tasks')
})
navigation.get('/login', (req, res) => {
  res.render('pages/login', {error: null})
})
navigation.get('/create', ensureAuthenticated, checkAdminUserGroups, (req, res) => {
  res.render('pages/create')
})
navigation.get('/prayer-wall', ensureAuthenticated, checkUserGroups, (req, res) => {
  res.render('pages/prayer-manager')
})
navigation.get('/print', ensureAuthenticated, checkUserGroups, (req, res) => {
  res.render('pages/print')
})
navigation.get('/refresh', (req, res) => {
  res.render('pages/refresh')
})
navigation.get('/dashboard', (req, res) => {
  res.render('pages/helpdesk-dashboard')
})
navigation.get('/chat', (req, res) => {
  res.render('pages/chat')
})


navigation.get('/logout', (req, res) => {
  try {
      req.session.user = null;
      req.session.access_token = null;
      req.session.refresh_token = null;
      res.redirect('/')
  } catch(err) {
      res.status(500).send({error: 'internal server error'})
  }
})

module.exports = navigation;