const express = require('express');
const router = express.Router();
const axios = require('axios');

const {ensureAdministrator} = require('../middleware/auth.js')
const StaffSchema = require('../models/Staff');

router.get('/update-staff', ensureAdministrator, async (req, res) => {
    res.render('pages/update-staff')
})

router.delete('/update-staff', ensureAdministrator, async (req, res) => {
    try {
        await StaffSchema.deleteMany({});
        res.status(201).json({msg: 'all entries deleted'})
    } catch (error) { res.status(500).json({ msg: error})}
})

router.post('/update-staff', ensureAdministrator, async (req, res) => {
    try {
        // console.log(staff)
        const staffSection = await StaffSchema.create( req.body )
        res.status(201).json({ staffSection })
    } catch (error) { console.log(error);res.status(500).json({ msg: error }) }
})

router.get('/staff', async (req, res) => {
    try {
        const staff = await StaffSchema.find({});
        res.status(201).json({ staff });
    } catch(error) { res.status(500).json({ msg: error }) }
})

module.exports = router;