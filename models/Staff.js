const mongoose = require('mongoose');
// import mongoose from 'mongoose'

const StaffSchema = new mongoose.Schema({
    Group_ID: {
    type: Number,
    required: [true, 'must provide an Group_ID']
  },
  Group_Title: {
    type: String,
    required: [true, 'must provide a Group_Title']
  },
  Participants: {
    type: Array,
    required: [true, 'must provide a list of Participants']
  }
});

// This is basic validation not advanced
module.exports = mongoose.model('Staff', StaffSchema);