const AttendanceSchema = require('../models/MainServiceAttendance');

const getAllAttendance = async (req, res) => {
    try {
        const attendance = await AttendanceSchema.find({});
        res.status(201).json( attendance );
    } catch (error) { res.status(500).json({ msg: error }) }
}

const createAttendance = async (req, res) => {
    try {
        const attendance = await AttendanceSchema.create(req.body)
        res.status(201).json({attendance})
    } catch (error) {
        res.status(500).json({msg:error})
    }
}

const deleteAllAttendance = async (req, res) => {
    try {
        await AttendanceSchema.deleteMany({});
        res.status(201).json({ success: true, message: "all deleted" });
    } catch (error) { res.status(500).json({ msg: error }) }
}

const getAttendanceByID = async (req, res) => {
    try {
        const attendance = await AttendanceSchema.findById(req.params.id).exec();
        res.status(201).json({ attendance });
    } catch (error) { res.status(500).json({ msg: error || 'There has been an error, try again later' }) }
}

const updateAttendanceByID = async (req, res) => {
    try {
        const { id } = req.params;
        const newAttendance = req.body;
        await AttendanceSchema.findOneAndUpdate({ _id: id }, newAttendance);
        res.status(201).json({ attendance: newAttendance });
    } catch (error) { res.status(500).json({ msg: error }) }
}

const deleteAttendanceByID = async (req, res) => {
    try {
        await AttendanceSchema.findByIdAndRemove(req.params.id);
        res.status(201).json({ success: true, message: `attendance with id ${req.params.id} deleted` });
    } catch (error) { res.status(500).json({ msg: error || 'There has been an error, try again later' }) }
}

module.exports = { getAllAttendance, createAttendance, deleteAllAttendance, getAttendanceByID, updateAttendanceByID, deleteAttendanceByID };
