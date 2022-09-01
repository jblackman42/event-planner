const express = require('express');
const router = express.Router();
const qs = require('qs')
const axios = require('axios');

router.post('/login', async (req, res) => {
    const {username, password} = req.body;
    
    //this video explains this axios request
    //https://youtu.be/r5N8MrQedcg?t=155
    //heres the docs for ministry platform oauth info
    //https://mpweb.azureedge.net/libraries/docs/default-source/kb/get_ready_ministryplatform_new_oauth3b8b080b-04b5-459c-ae7f-0a610de0a5fa.pdf?sfvrsn=db969991_3
    axios({
        method: 'post',
        url: 'https://my.pureheart.org/ministryplatformapi/oauth/connect/token',
        data: qs.stringify({
            grant_type: "password",
            scope: "http://www.thinkministry.com/dataplatform/scopes/all",
            client_id: "event-planner",
            username: username,
            password: password
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${process.env.BASIC_AUTH_SECRET}`
        }
    })
        .then(response => {
            const {access_token} = response.data;
            const {data} = response.config;
            if (access_token) {
                //gets all params passed from data, then gets the username={username}, then gets the username itself, then removes the email part at the end
                const username = data.split('&').filter(param => param.includes('username'))[0].split('=')[1].split('%40')[0]
                // console.log(username)

                axios({
                    method: 'get',
                    url: `https://my.pureheart.org/ministryplatformapi/users?%24logOnName=${username}`,
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${access_token}`
                    }
                })
                    .then(response => {
                        const {Id} = response.data[0];
                        res.cookie('user_id', Id, {expire : new Date() + 3600})
                        res.cookie('access_token', access_token, {expire : new Date() + 3600})
                        res.send({success: true})
                    })
                    .catch(err => {
                        res.send({success: false, error: 'internal server error: please try again later.'})
                    })
            } else {
                console.log('no access token')
                res.send({success: false, error: 'invalid credentials'})
            }
        })
        .catch(err => {
            res.send({success: false, error: 'invalid credentials'})
        })
})

router.get('/redirect', (req, res) => {
    console.log(req.query)
    res.sendStatus(200)
    // res.redirect(`/loading`)
})

router.get('/me', (req, res) => {
    const token = req.cookies.id_token;
    if (!token) return res.json({user: null})

    axios.post('https://my.pureheart.org/ministryplatformapi/oauth/connect/userinfo', {
        headers: {
            Authorization: 'Bearer ' + token
        }
    })
        // .then(res => res.json())
        .then(res => console.log(res.data))
        .catch(err => {
            console.log(err)
        })
    
    return res.status(200).json({user: true})
})

module.exports = router;