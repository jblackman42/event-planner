const express = require('express');
const router = express.Router();
const axios = require('axios');
const qs = require('qs')

const {ensureAdministrator, ensureWebhook} = require('../middleware/auth.js')
// const StaffSchema = require('../models/Staff');
// const SermonSchema = require('../models/Sermons');

router.post('/staff', async (req, res) => {
    const {Contact_ID_List} = req.body;

    if (!Contact_ID_List) {
        res.status(403).send({msg: "Procedure or function 'api_Widget_GetStaff' expects parameter '@Contact_ID_List', which was not supplied."})
    }
    
    const accessToken = await axios({
        method: 'post',
        url: 'https://my.pureheart.org/ministryplatformapi/oauth/connect/token',
        data: qs.stringify({
            grant_type: "client_credentials",
            scope: "http://www.thinkministry.com/dataplatform/scopes/all",
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET
        })
    })
        .then(response => response.data.access_token)
        .catch(err => console.error(err))

    const data = await axios({
        method: 'post',
        url: `https://my.pureheart.org/ministryplatformapi/procs/api_Widget_GetStaff`,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        data: {
            "@Contact_ID_List": Contact_ID_List
        }
    })
        .then(response => response.data[0])
        .catch(err => console.error('oops something went terribly wrong'))

    res.status(200).send(data).end();
})

// sermons widget here -------------------------------------------------------------------------------

router.get('/series', async (req, res) => {
    let SeriesType = req.query.SeriesType;
    let SeriesID = req.query.SeriesID;

    if (!SeriesType) {
        SeriesType = 1;
    }
    
    const accessToken = await axios({
        method: 'post',
        url: 'https://my.pureheart.org/ministryplatformapi/oauth/connect/token',
        data: qs.stringify({
            grant_type: "client_credentials",
            scope: "http://www.thinkministry.com/dataplatform/scopes/all",
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET
        })
    })
        .then(response => response.data.access_token)
        .catch(err => console.error(err))

    const data = await axios({
        method: 'post',
        url: `https://my.pureheart.org/ministryplatformapi/procs/api_Widget_GetAllSeries`,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        data: {
            "@Sermon_Series_Type_ID": SeriesType,
            "@Sermon_Series_ID": SeriesID || null
        }
    })
        .then(response => response.data[0])
        .catch(err => console.error(err))

    res.status(200).send(data).end();
})

router.get('/sermons', async (req, res) => {
    let SeriesID = req.query.SeriesID

    if (!SeriesID) {
        res.status(403).send({msg: "Procedure or function 'api_Widget_GetSeries' expects parameter '@Sermon_Series_ID', which was not supplied."})
    }
    
    const accessToken = await axios({
        method: 'post',
        url: 'https://my.pureheart.org/ministryplatformapi/oauth/connect/token',
        data: qs.stringify({
            grant_type: "client_credentials",
            scope: "http://www.thinkministry.com/dataplatform/scopes/all",
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET
        })
    })
        .then(response => response.data.access_token)
        .catch(err => console.error(err))

    const data = await axios({
        method: 'post',
        url: `https://my.pureheart.org/ministryplatformapi/procs/api_Widget_GetSeries`,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        data: {
            "@Sermon_Series_ID": SeriesID
        }
    })
        .then(response => response.data[0])
        .catch(err => console.error(err))

    res.status(200).send(data).end();
})

router.get('/featured-events', async (req, res) => {
    const accessToken = await axios({
        method: 'post',
        url: 'https://my.pureheart.org/ministryplatformapi/oauth/connect/token',
        data: qs.stringify({
            grant_type: "client_credentials",
            scope: "http://www.thinkministry.com/dataplatform/scopes/all",
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET
        })
    })
        .then(response => response.data.access_token)
        .catch(err => console.error(err))

    const data = await axios({
        method: 'post',
        url: `https://my.pureheart.org/ministryplatformapi/procs/api_Widget_GetFeaturedEvents`,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.data[0])
        .catch(err => console.error(err))

    res.status(200).send(data).end();
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

router.get('/unsubscribe', async (req, res) => {
    const id = req.query.id;

    try {
        //get access token for accessing database informatin
        const accessToken = await axios({
            method: 'get',
            mode: 'cors',
            url: 'https://phc.events/api/oauth/authorize'
        })
            .then(response => response.data.access_token)
            .catch(err => console.error(err))

        await axios({
            method: 'put',
            url: 'https://my.pureheart.org/ministryplatformapi/tables/Prayer_Requests',
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            data: [{
                "Prayer_Request_ID": id,
                "Prayer_Notify": false,
            }]
        })

        res.sendStatus(200);
    } catch (e) {
        console.log(e)
        res.sendStatus(500);
    }
})

module.exports = router;