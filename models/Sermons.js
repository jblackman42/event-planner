const mongoose = require('mongoose');
// import mongoose from 'mongoose'

const SermonSchema = new mongoose.Schema({
    Sermon_Series_ID: {
        type: Number,
        require: [true, 'must provide Sermon_Series_Id']
    },
    Title: {
        type: String,
        require: [true, 'must provide Title']
    },
    Display_Title: {
        type: String
    },
    Subtitle: {
        type: String
    },
    Status_ID: {
        type: Number,
        require: [true, 'must provide Status_ID']
    },
    Position: {
        type: Number
    },
    Sermon_Series_Type_ID: {
        type: Number,
        require: [true, 'must provide Sermon_Series_Type_ID']
    },
    Series_UUID: {
        type: String,
        require: [true, 'must provide Series_UUID']
    },
    Series_Image: {
        type: String,
        require: [true, 'must provide Series_Image']
    },
    Series_Start_Date: {
        type: Date,
        require: [true, 'must provide Series_Start_Date']
    },
    Enable_On_OTT: {
        type: Boolean
    },
    Sermon_Series_Roku_Category_ID: {
        type: Number
    },
    fileId: {
        type: String,
        require: [true, 'must provide fileId']
    },
    messages: {
        type: Array
    }
});

// This is basic validation not advanced
module.exports = mongoose.model('Sermon', SermonSchema);