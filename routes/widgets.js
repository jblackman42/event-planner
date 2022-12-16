const express = require('express');
const router = express.Router();
const axios = require('axios');
const cors = require('cors');

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

router.post('/staff', async (req, res) => {
    try {
        const {ids} = req.body;
        const staff = await StaffSchema.find({Contact_ID: ids});
        res.status(201).json({ staff });
    } catch(error) { res.status(500).json({ msg: error }) }
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
    
    const getStaffGroupParticipants = async () => {
        return await axios({
            method: 'get',
            url: `https://my.pureheart.org/ministryplatformapi/tables/Group_Participants?$filter=GETDATE() BETWEEN CONVERT(DATE,Start_Date) AND ISNULL(End_Date,GETDATE()) AND Group_ID=${2473}`,
            mode: 'cors',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(response => response.data.map(participant => participant.Participant_ID))
            .catch(err => console.error(err))

    }

    const getParticipantFromID = async (Participant_ID) => {
        return await axios({
            method: 'get',
            url: `https://my.pureheart.org/ministryplatformapi/tables/Participants?$select=Contact_ID&$filter=Participant_ID=${Participant_ID}`,
            mode: 'cors',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(response => response.data[0].Contact_ID)
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
            .then(response => {
                // console.log(Contact_ID, response.data)
                return response.data[0]
            })
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
        await StaffSchema.deleteMany();

        const allStaff = await getStaffGroupParticipants();

        const allParticipants = [];
        for (let i = 0; i < allStaff.length; i ++) {
            const participantContactID = await getParticipantFromID(allStaff[i]);
            const contact = await getContactFromID(participantContactID);
            const staffRecord = await getStaffRecordFromContactID(participantContactID);
            const staffFile = await getFilesFromContactID(participantContactID);
            const Image_URL = !staffFile ? null : `https://my.pureheart.org/ministryplatformapi/files/${staffFile.UniqueFileId}`
            
            const {Contact_ID, Display_Name, First_Name, Last_Name, Nickname, Email_Address} = contact;
            console.log(`${i + 1}/${allStaff.length}`)
            const {Job_Title, Start_Date, End_Date, Bio} = staffRecord ? staffRecord : {Job_Title: null, Start_Date: null, End_Date: null, Bio: null};
            
            const participantObject = {                Contact_ID: Contact_ID,
                Display_Name: Display_Name,
                First_Name: First_Name,
                Last_Name: Last_Name,
                Nickname: Nickname,
                Email_Address: Email_Address,
                Job_Title: Job_Title,
                Start_Date: Start_Date,
                End_Date: End_Date,
                Bio: Bio,
                Image_URL: Image_URL
            }
            allParticipants.push(participantObject);
            await StaffSchema.create(participantObject);
        }
        res.status(200).json({allParticipants})
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

router.post('/opportunity-auto-place', ensureWebhook, async (req, res) => {
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
        const data = [{"Response_ID": parseInt(id),"Response_Result_ID": 1}]
        await axios({
            url: 'https://my.pureheart.org/ministryplatformapi/tables/Responses',
            method: 'PUT',
            mode: 'cors',
            data: JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken,
            }
        })
            .then(response => response.data)
            .then((data) => {
                res.sendStatus(200)
            })
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

router.post('/email', ensureWebhook, async (req, res) => {
    const apiUserId = 6580;
    const apiUserContactId = 95995;

    const {Subject, Name, Email, Message, RecipientContactID} = req.body;

    //get access token for accessing database informatin
    const accessToken = await axios({
        method: 'get',
        mode: 'cors',
        url: 'https://phc.events/api/oauth/authorize'
    })
        .then(response => response.data.access_token)
        .catch(err => console.error(err))

    try {
        await axios({
            method: 'post',
            url: 'https://my.pureheart.org/ministryplatformapi/communications',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken,
            },
            data: {
                "AuthorUserId": apiUserId,
                "Subject": Subject,
                "Body": Message,
                "FromContactId": apiUserContactId,
                "ReplyToContactId": apiUserContactId,
                "ReplyToName": Name,
                "ReplyToAddress": Email,
                "ExcludeOptedOutOfBulkMessages": false,
                "Contacts": [RecipientContactID]
            }
        })
        res.sendStatus(200)
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

module.exports = router;