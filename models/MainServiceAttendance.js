const mongoose = require('mongoose');
// import mongoose from 'mongoose'

const AttendanceSchema = new mongoose.Schema({
    Year: {
        type: Number,
        required: [true, "Must provide year"]
    },
    Month: {
        type: Number,
        required: [true, "Must provide month"]
    },
    Day: {
        type: Number,
        required: [true, "Must provide day"]
    },
    Time: {
        type: String,
        default: null
    },
    Campus: {
        type: String,
        required: [true, "Must provide campus"]
    },
    Attendance: {
        type: Number,
        default: 0
    }
});

// This is basic validation not advanced
module.exports = mongoose.model('MainAttendance', AttendanceSchema);