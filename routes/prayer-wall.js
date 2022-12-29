const express = require('express');
const router = express.Router();
const axios = require('axios');
const schedule = require('node-schedule');


const scheduledToNotify = [];

//sends emails out at 2:00PM each day
schedule.scheduleJob('14 * * *', function(){
    sendNotifications();
});

const sendNotifications = async () => {
    const access_token = await axios({
        method: 'get',
        url: `${process.env.DOMAIN_NAME}/api/oauth/authorize`
    })
    .then(response => response.data.access_token)

    const uniquePrayerIDs = [...new Set(scheduledToNotify)]
    scheduledToNotify.length = 0;
    console.log(uniquePrayerIDs)

    for (let i = 0; i < uniquePrayerIDs.length; i ++) {
        const prayerRequest = await axios({
            method: 'get',
            url: `https://my.pureheart.org/ministryplatformapi/tables/Prayer_Requests/${uniquePrayerIDs[i]}`,
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(response => response.data[0])

        const {Author_Name, Author_Email, Prayer_Count} = prayerRequest;
        console.log('sending email notif to ' + Author_Email)
        await axios({
            method: 'post',
            url: 'https://my.pureheart.org/ministryplatformapi/messages',
            headers: {
                'content-type': 'application/json',
                'authorization': `Bearer ${access_token}`
            },
            data: {
                "FromAddress": { "DisplayName": "Prayer Wall", "Address": "noreply@pureheart.org" },
                "ToAddresses": 
                [ 
                    { "DisplayName": Author_Name, "Address": Author_Email }
                ],
                "ReplyToAddress": { "DisplayName": "noreply@pureheart.org", "Address": "noreply@pureheart.org" },
                "Subject": "You're covered in prayer",
                "Body": `Your recent contribution to the Pure Heart Church Prayer Wall has just been prayed for! It has now been prayed for ${Prayer_Count} times.`
            }
        })
    }

    return uniquePrayerIDs;
}

router.get('/send-notifications', async (req, res) => {
    const notificationIDs = await sendNotifications();
    res.status(200).send({notificationIDs}).end();
})

router.get('/', async (req, res) => {
    const access_token = await axios({
        method: 'get',
        url: `${process.env.DOMAIN_NAME}/api/oauth/authorize`
    })
    .then(response => response.data.access_token)

    const {skip} = req.query;
    
    const prayer_requests = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Prayer_Requests?%24filter=Prayer_Status_ID%3D2&%24orderby=Date_Created%20DESC&%24top=18&%24skip=${skip}`,
        // url: `https://my.pureheart.org/ministryplatformapi/tables/Prayer_Requests?$filter=Prayer_Status_ID=2&$top=18&$skip=${skip}`,
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(response => response.data.map(prayer => {
        if (prayer.Private) {
            prayer.Author_Email = 'Anonymous';
            prayer.Author_Name = 'Anonymous';
            prayer.Author_Phone = 'Anonymous';
        }
        return prayer;
    }))
    .catch(err => console.log(err))
    
    res.status(200).json({prayer_requests}).end();
})

router.get('/:id', async (req, res) => {
    const access_token = await axios({
        method: 'get',
        url: `${process.env.DOMAIN_NAME}/api/oauth/authorize`
    })
    .then(response => response.data.access_token)

    const prayer_request = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Prayer_Requests/${req.params.id}`,
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(response => response.data[0])
    .catch(err => console.log(err))
    
    res.status(200).json({prayer_request}).end();
})

router.post('/', async (req, res) => {
    const access_token = await axios({
        method: 'get',
        url: `${process.env.DOMAIN_NAME}/api/oauth/authorize`
    })
    .then(response => response.data.access_token)

    const status = await axios({
        method: 'post',
        url: 'https://my.pureheart.org/ministryplatformapi/tables/Prayer_Requests',
        headers: {
            'content-type': 'application/json',
            'authorization': `Bearer ${access_token}`
        },
        data: [req.body]
    })
    .then(response => response.status)
    .catch(err => console.log(err))
    
    res.sendStatus(status)
})

router.put('/', async (req, res) => {
    const access_token = await axios({
        method: 'get',
        url: `${process.env.DOMAIN_NAME}/api/oauth/authorize`
    })
    .then(response => response.data.access_token)

    try {
        const {Prayer_Request_ID, Prayer_Notify} = req.body;
        if (Prayer_Notify) scheduledToNotify.push(Prayer_Request_ID)
        console.log(scheduledToNotify)
        const data = await axios({
            method: 'put',
            url: 'https://my.pureheart.org/ministryplatformapi/tables/Prayer_Requests',
            headers: {
                'Authorization': `Bearer ${access_token}`
            },
            data: [req.body]
        })
        .then(response => response)
        .catch(err => console.log(err))

        res.sendStatus(200)
    } catch (err) {
        res.sendStatus(500)
    }
})

router.post('/send-email', async (req, res) => {
    const access_token = await axios({
        method: 'get',
        url: `${process.env.DOMAIN_NAME}/api/oauth/authorize`
    })
    .then(response => response.data.access_token)

    try {
        const {recipientName, recipientEmail, Prayer_Count} = req.body;

        res.sendStatus(200)
    } catch (err) {
        res.sendStatus(500)
    }
})

module.exports = router;