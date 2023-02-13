const express = require('express');
const router = express.Router();
const axios = require('axios');
const cors = require('cors');

const {ensureAdministrator, ensureWebhook} = require('../middleware/auth.js')

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