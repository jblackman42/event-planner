const mongoose = require('mongoose');
// import mongoose from 'mongoose'

const StaffSchema = new mongoose.Schema({
  Contact_ID: {
    type: Number,
    require: [true, "must provide Contact_ID"]
  },
  Display_Name: {
    type: String,
    require: [true, "must provide Display_Name"]
  },
  First_Name: {
    type: String,
    require: [true, "must provide First_Name"]
  },
  Last_Name: {
    type: String,
    require: [true, "must provide Last_Name"]
  },
  Nickname: {
    type: String,
    require: [true, "must provide Nickname"]
  },
  Email_Address: {
    type: String,
    require: [true, "must provide Email_Address"]
  },
  Job_Title: {
    type: String,
    require: [true, "must provide Job_Title"]
  },
  Start_Date: {
    type: Date,
    require: [true, "must provide Start_Date"]
  },
  End_Date: {
    type: Date,
    require: [true, "must provide End_Date"]
  },
  Bio: {
    type: String,
    require: [true, "must provide Bio"]
  },
  Image_URL: {
    type: String,
    require: [true, "must provide Image_URL"]
  }
});

// This is basic validation not advanced
module.exports = mongoose.model('Staff', StaffSchema);