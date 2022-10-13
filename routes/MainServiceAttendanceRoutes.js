const express = require('express');
const router = express.Router();

const { getAllAttendance, createAttendance, deleteAllAttendance, getAttendanceByID, updateAttendanceByID, deleteAttendanceByID } = require('../controllers/MainServiceAttendanceController');

router.route('').get(getAllAttendance).post(createAttendance).delete(deleteAllAttendance)
router.route('/:id').get(getAttendanceByID).patch(updateAttendanceByID).delete(deleteAttendanceByID)

module.exports = router;