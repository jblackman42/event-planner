const express = require('express');
const navigation = express.Router();
const path = require('path');
//authentication middleware
const {ensureAuthenticated, ensureAdminAuthenticated} = require('../middleware/auth.js')

navigation.get('/help', (req, res) => {
  res.render('pages/help')
})
//home page
navigation.get('/', ensureAuthenticated, (req, res) => {
  res.render('pages/calendar')
})
navigation.get('/calendar', ensureAuthenticated, (req, res) => {
  res.render('pages/calendar')
})
navigation.get('/my-tasks', ensureAuthenticated, (req, res) => {
  res.render('pages/my-tasks')
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
navigation.get('/print', ensureAdminAuthenticated, (req, res) => {
  res.render('pages/print')
})

module.exports = navigation;