const express = require('express');
const router = express.Router();
const axios = require('axios');

const {ensureAdministrator, ensureWebhook} = require('../middleware/auth.js')
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

router.get('/webhook-update-staff', ensureWebhook, async (req, res) => {
    
    //delete all staff records
    await StaffSchema.deleteMany({});

    //get access token for accessing database informatin
    const accessToken = await axios({
        method: 'get',
        mode: 'cors',
        url: 'https://phc.events/api/oauth/authorize'
    })
        .then(response => response.data.access_token)
        .catch(err => console.error(err))
        
    //2443 - lead pastor
    //2464 - executive and campus pastors
    //2387 - lead pastors
    //2388 - pastors
    //2389 - directors
    //2390 - support staff
    const webStaffGroupIDs = [
        {id: 2443, title: "Senior Pastor"},
        {id: 2464, title: "Executive and Campus Pastors"},
        {id: 2387, title: "Lead Pastors"},
        {id: 2388, title: "Pastors"},
        {id: 2389, title: "Directors"},
        {id: 2390, title: "Support Staff"},
    ]
    const getWebStaffGroupParticipants = async (Group_ID) => {
        return await axios({
            method: 'get',
            url: `https://my.pureheart.org/ministryplatformapi/tables/Group_Participants?%24select=Participant_ID&%24filter=Group_ID%3D${Group_ID}%20AND%20End_Date%20IS%20NULL`,
            mode: 'cors',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(response => response.data)
            .catch(err => console.error(err))

    }

    const getParticipantFromID = async (Participant_ID) => {
        return await axios({
            method: 'get',
            url: `https://my.pureheart.org/ministryplatformapi/tables/Participants/${Participant_ID}`,
            mode: 'cors',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(response => response.data[0])
            .catch(err => console.error(err))
    }

    const getContactFromID = async (Contact_ID) => {
        return await axios({
            method: 'get',
            url: `https://my.pureheart.org/ministryplatformapi/tables/Contacts/${Contact_ID}`,
            mode: 'cors',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(response => response.data[0])
            .catch(err => console.error(err))
    }

    const getFilesFromContactID = async (Contact_ID) => {
        return await axios({
            method: 'get',
            url: `https://my.pureheart.org/ministryplatformapi/files/Contacts/${Contact_ID}`,
            mode: 'cors',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(response => response.data.filter(file => file.IsDefaultImage)[0])
            .catch(err => console.error(err))
    }
    //link for images
    //https://my.pureheart.org/ministryplatformapi/files/${FileId}

    const getStaffRecordFromContactID = async (Contact_ID) => {
        return await axios({
            method: 'get',
            url: `https://my.pureheart.org/ministryplatformapi/tables/Staff?%24filter=Contact_ID=${Contact_ID}`,
            mode: 'cors',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(response => response.data[0])
            .catch(err => console.error(err))
    }

    const formatStaff = async () => {

        for (let i = 0; i < webStaffGroupIDs.length; i ++) {
            const {id, title} = webStaffGroupIDs[i];
            let staffParticipants = [];
            const participants = await getWebStaffGroupParticipants(id)
            for (let j = 0; j < participants.length; j ++) {

                const {Contact_ID} = await getParticipantFromID(participants[j].Participant_ID)
                const contact = await getContactFromID(Contact_ID);
                const {Nickname, First_Name, Last_Name, Email_Address, Email_Unlisted, Mobile_Phone, Mobile_Phone_Unlisted, Web_Page} = contact;
                const {Job_Title, Bio} = await getStaffRecordFromContactID(Contact_ID);
                const {UniqueFileId} = await getFilesFromContactID(Contact_ID);
                const imageUrl = `https://my.pureheart.org/ministryplatformapi/files/${UniqueFileId}`
                const display_name = `${Nickname} ${Last_Name}`;
                const email = Email_Unlisted ? null : Email_Address;
                const phone = Mobile_Phone_Unlisted ? null : Mobile_Phone;
                
                staffParticipants.push({
                    Contact_ID: Contact_ID,
                    First_Name: First_Name,
                    Last_Name: Last_Name,
                    Display_Name: display_name,
                    Email: email,
                    Phone: phone,
                    Job_Title: Job_Title,
                    Image_URL: imageUrl,
                    Web_Page: Web_Page,
                    Bio: Bio
                })
            }
            await StaffSchema.create( {
                Group_ID: id,
                Group_Title: title,
                Participants: staffParticipants
            } )
        }
        res.sendStatus(200)
    }

    formatStaff()
})

module.exports = router;