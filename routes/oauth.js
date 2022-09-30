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
                        console.error(err)
                        res.send({success: false, error: 'internal server error: please try again later.'})
                    })
            } else {
                res.render('pages/login', {error: 'Incorrect Username or Password'})
            }
        })
        .catch(err => {
            res.send({success: false, error: 'Incorrect Username or Password'})
        })
})

router.get('/me', async (req, res) => {
    const {user_id, token} = req.query;
    if (!user_id || !token) return res.json({user: null})


    try {
        axios({
            method: 'get',
            url: `https://my.pureheart.org/ministryplatformapi/users/${user_id}`,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.data)
            .then(data => res.json({user: data}))
            .catch(err => {
                res.json({user: null})
            })
    }
    catch {
        res.json({user: null})
    }
})

router.get('/me/roles', async (req, res) => {
    const {user_id, token} = req.query;
    if (!user_id || !token) return res.json({user: null})

    try {
        axios({
            method: 'get',
            url: `https://my.pureheart.org/ministryplatformapi/tables/dp_User_Roles?%24filter=User_ID=${user_id}`,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.data)
            .then(data => res.json({userRoles: data}))
            .catch(err => {
                res.json({user: null})
            })
    } catch {
        res.json({userRoles: null})
    }
})

router.get('/authorize', async (req, res) => {
    const data = await axios({
        method: 'post',
        url: 'https://my.pureheart.org/ministryplatformapi/oauth/connect/token',
        data: qs.stringify({
            grant_type: "client_credentials",
            scope: "http://www.thinkministry.com/dataplatform/scopes/all",
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET
        })
    })
        .then(response => response.data)
    const {access_token, expires_in} = data;
    const expiresDate = new Date(new Date().getTime() + (expires_in * 1000)).toISOString()
    res.send({access_token: access_token, expires_in: expiresDate})
})

module.exports = router;