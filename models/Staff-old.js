const mongoose = require('mongoose');
// import mongoose from 'mongoose'

const StaffSchemaOld = new mongoose.Schema({
  Group_ID: {
    type: Number,
    require: [true, 'Must Provide Group_ID'] 
  },
  Group_Title: {
    type: String,
    require: [true, 'Must Provide Group_Title'] 
  },
  Participants: {
    type: Array,
    require: [true, 'Must Provide Participants']
  }
});

// This is basic validation not advanced
module.exports = mongoose.model('Staff2', StaffSchemaOld);