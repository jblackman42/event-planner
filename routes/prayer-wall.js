const express = require('express');
const router = express.Router();
const axios = require('axios');
const schedule = require('node-schedule');


const sendNotifications = async (req, res) => {
    const access_token = await axios({
        method: 'get',
        url: `${process.env.DOMAIN_NAME}/api/oauth/authorize`
    })
    .then(response => response.data.access_token)

    const prayersToNotify = await axios({
        method: 'get',
        //gets all prayer requests that are to be scheduled for notification within the last 2 weeks
        url: 'https://my.pureheart.org/ministryplatformapi/tables/Prayer_Requests?$filter=Date_Created > dateadd(week,-2,getdate()) AND Notification_Scheduled=1',
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
        .then(response => response.data)
        .catch(err => console.error(err))

    console.log(prayersToNotify.length)
    for (let i = 0; i < prayersToNotify.length; i ++) {

        const {Author_Name, Author_Email, Prayer_Count} = prayersToNotify[i];
        //send email to prayer authors letting them know how many times their request has been prayed for
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
        //removes notification scheduled bit field
        prayersToNotify[i].Notification_Scheduled = 0;
        await axios({
            method: 'put',
            url: 'https://my.pureheart.org/ministryplatformapi/tables/Prayer_Requests',
            headers: {
                'Authorization': `Bearer ${access_token}`
            },
            data: [prayersToNotify[i]]
        })
    }
    
    if (!req) return console.log(`sent ${prayersToNotify.length} ${prayersToNotify.length == 1 ? 'notification' : 'notifications'}`)
    res.status(200).send({msg: `sent ${prayersToNotify.length} ${prayersToNotify.length == 1 ? 'notification' : 'notifications'}`}).end()
}

//sends emails out at 5:00PM each day
// 8AM
schedule.scheduleJob('8 * * *', () => sendNotifications());


router.get('/send-notifications', async (req, res) => {
    return await sendNotifications(req, res)
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
    .then(response => response.data.map(prayer => {
        if (prayer.Private) {
            prayer.Author_Email = 'Anonymous';
            prayer.Author_Name = 'Anonymous';
            prayer.Author_Phone = 'Anonymous';
        }
        return prayer;
    })[0])
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
        console.log(err)
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