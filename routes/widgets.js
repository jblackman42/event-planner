const express = require('express');
const router = express.Router();
const axios = require('axios');

const {ensureAdministrator, ensureWebhook} = require('../middleware/auth.js')
const StaffSchema = require('../models/Staff');
const SermonSchema = require('../models/Sermons');

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

router.get('/staff-email', async (req, res) => {
    try {
        const {sectionId, staffId} = req.query;

        const allStaff = await StaffSchema.find({});
        console.log(sectionId, staffId)
        const Email = allStaff[sectionId].Participants[staffId].Email
        res.status(201).json({ Email });
    } catch(error) { console.error(error); res.status(500).json({ msg: error }) }
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

// sermons widget here -------------------------------------------------------------------------------

router.get('/update-sermons', ensureAdministrator, async (req, res) => {
    res.render('pages/update-sermons')
})

router.get('/sermons', async (req, res) => {
    try {
        const sermons = await SermonSchema.find({});
        res.status(201).json({ sermons });
    } catch(error) { res.status(500).json({ msg: error }) }
})
router.get('/sermon', async (req, res) => {
    try {
        const sermon = await SermonSchema.find({Sermon_Series_ID: req.query.id});
        res.status(201).json({ sermon });
    } catch(error) { res.status(500).json({ msg: error }) }
})

router.delete('/update-sermons', ensureAdministrator, async (req, res) => {
    try {
        await SermonSchema.deleteMany({});
        res.status(201).json({msg: 'all entries deleted'})
    } catch (error) { res.status(500).json({ msg: error})}
})

router.post('/update-sermons', ensureAdministrator, async (req, res) => {
    try {
        // console.log(staff)
        const sermonSection = await SermonSchema.create( req.body )
        res.status(201).json({ sermonSection })
    } catch (error) { console.log(error);res.status(500).json({ msg: error }) }
})

router.get('/webhook-update-sermons', ensureWebhook, async (req, res) => {
    
    //delete all staff records
    await SermonSchema.deleteMany({});

    //get access token for accessing database informatin
    const accessToken = await axios({
        method: 'get',
        mode: 'cors',
        url: 'https://phc.events/api/oauth/authorize'
    })
        .then(response => response.data.access_token)
        .catch(err => console.error(err))
    
    //get sermon series list
    const sermons = await axios({
        url: 'https://my.pureheart.org/ministryplatformapi/tables/Pocket_Platform_Sermon_Series?$filter=Series_Start_Date < GETDATE() AND Sermon_Series_Type_ID = 1&$orderby=Series_Start_Date DESC',
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken,
        }
    })
        .then(response => response.data)
    
    for (let i = 0; i < sermons.length; i ++) {
        //get series image
        const file = await axios({
            url: `https://my.pureheart.org/ministryplatformapi/files/Pocket_Platform_Sermon_Series/${sermons[i].Sermon_Series_ID}`,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken,
            }
        })
            .then(response => response.data)

        sermons[i].fileId = file[0] ? file[0].UniqueFileId : null;
        sermons[i].Series_Image = file[0] ? `https://my.pureheart.org/ministryplatformapi/files/${file[0].UniqueFileId}` : null;

        //get messages in series
        const messages = await axios({
            url: `https://my.pureheart.org/ministryplatformapi/tables/Pocket_Platform_Sermons?%24filter=Series_ID=${sermons[i].Sermon_Series_ID}`,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken,
            }
        })
            .then(response => response.data)

        sermons[i].messages = messages;

        //get watch/listen links
        for (let j = 0; j < messages.length; j ++) {
            const links = await axios({
                url: `https://my.pureheart.org/ministryplatformapi/tables/Pocket_Platform_Sermon_Links?%24filter=Sermon_ID=${messages[j].Sermon_ID}`,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accessToken,
                }
            })
                .then(response => response.data)
            
            sermons[i].messages[j].links = links;

            const fileId = await axios({
                url: `https://my.pureheart.org/ministryplatformapi/files/Pocket_Platform_Sermons/${sermons[i].messages[j].Sermon_ID}`,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accessToken,
                }
            })
                .then(response => response.data[0]);
                sermons[i].messages[j].Sermon_Image = fileId ? `https://my.pureheart.org/ministryplatformapi/files/${fileId.UniqueFileId}` : null;

            const speakerName = await axios({
                url: `https://my.pureheart.org/ministryplatformapi/tables/Pocket_Platform_Speakers/${sermons[i].messages[j].Speaker_ID}`,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accessToken,
                }
            })
                .then(response => response.data[0]);
                sermons[i].messages[j].Speaker = speakerName ? speakerName.Display_Name : null;
        }
        console.log(`${i + 1} / ${sermons.length}`)
    }

    for (let i = 0; i < sermons.length; i ++) {
        await SermonSchema.create(sermons[i]);
        console.log(`${i + 1} / ${sermons.length}`)
    }
    res.sendStatus(200)
})

router.get('/opportunity-auto-place', ensureWebhook, async (req, res) => {
    //get access token for accessing database informatin
    const accessToken = await axios({
        method: 'get',
        mode: 'cors',
        url: 'https://phc.events/api/oauth/authorize'
    })
        .then(response => response.data.access_token)
        .catch(err => console.error(err))
    try {
        const {id} = req.body;
        if (!id) return res.sendStatus(400)
        const data = [{"Response_ID": id,"Response_Result_ID": 1}]
        await axios({
            url: 'https://my.pureheart.org/ministryplatformapi/tables/Responses',
            method: 'PUT',
            data: JSON.stringify(data),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken,
            }
        })
            .then(response => response.data)
            .then(() => {
                res.sendStatus(200)
            })
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

module.exports = router;