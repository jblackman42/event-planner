const express = require('express');
const router = express.Router();
const qs = require('qs')
const axios = require('axios');

router.post('/login', async (req, res) => {
    //this video explains this axios request
    //https://youtu.be/r5N8MrQedcg?t=155
    //heres the docs for ministry platform oauth info
    //https://mpweb.azureedge.net/libraries/docs/default-source/kb/get_ready_ministryplatform_new_oauth3b8b080b-04b5-459c-ae7f-0a610de0a5fa.pdf?sfvrsn=db969991_3
    
    const {username, password, remember} = req.body;
    
    try {
        const login = await axios({
            method: 'post',
            url: `${process.env.BASE_URL}/oauth/connect/token`,
            data: qs.stringify({
                grant_type: "password",
                scope: "http://www.thinkministry.com/dataplatform/scopes/all openid offline_access",
                client_id: process.env.CLIENT_ID,
                username: username,
                password: password
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')}`
            }
        })
            .then(response => response.data)
        
        const {access_token, token_type, refresh_token, expires_in} = login;

        const user = await axios({
            method: 'get',
            url: `${process.env.BASE_URL}/oauth/connect/userinfo`,
            headers: {
                'Authorization': `${token_type} ${access_token}`
            }
        })
            .then(response => response.data)
            .catch(err => console.log(err))

        req.session.user = user;
        req.session.access_token = access_token;
        // if user selected keep me logged in, set refresh token, otherwise set in to null
        req.session.refresh_token = remember ? refresh_token : null;
        
        res.status(200).send(user).end();
    } catch (err) {
        if (err.response && err.response.data.error_description) {
            res.status(403).send({error: err.response.data.error_description}).end();
        } else if (err.response && err.response.data) {
            res.status(403).send({error: err.response.data.error}).end();
        } else {
            console.log(err)
            res.status(500).send({error: 'internal server error'})
        }
    }
})

router.get('/user', (req, res) => {
    if (req.session.user) {
        res.send(req.session.user).end()
    } else {
        res.send(null).end()
    }
})

router.get('/client-authorize', async (req, res) => {
    res.send({ access_token: req.session.access_token });
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

router.get('/refresh', async (req, res) => {
    try {
        const data = await axios({
            method: 'post',
            url: 'https://my.pureheart.org/ministryplatformapi/oauth/connect/token',
            data: qs.stringify({
                grant_type: "client_credentials",
                scope: "http://www.thinkministry.com/dataplatform/scopes/all",
                client_id: process.env.APP_CLIENT_ID,
                client_secret: process.env.APP_CLIENT_SECRET
            })
        })
            .then(response => response.data)
            .catch(err => console.error(err))
        const {access_token} = data;
    
        await axios({
            method: 'get',
            url: 'https://my.pureheart.org/ministryplatformapi/refreshMetadata',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'Application/Json'
            }
        })

        console.log('refresh')
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }

})

router.get('/isAdmin', async (req, res) => {
    try {
        const data = await axios({
            method: 'post',
            url: 'https://my.pureheart.org/ministryplatformapi/oauth/connect/token',
            data: qs.stringify({
                grant_type: "client_credentials",
                scope: "http://www.thinkministry.com/dataplatform/scopes/all",
                client_id: process.env.APP_CLIENT_ID,
                client_secret: process.env.APP_CLIENT_SECRET
            })
        })
            .then(response => response.data)
            .catch(err => console.error(err))
        const {access_token} = data;

        const groupUserIds = await axios({
            method: 'get',
            url: `${process.env.BASE_URL}/tables/dp_User_User_Groups?$filter=User_Group_ID=${process.env.AUTHORIZED_ADMIN_GROUP_ID}`,
            headers: {
                'authorization': `Bearer ${access_token}`
            }
        })
            .then(response => response.data.map(user => parseInt(user.User_ID)))
            .catch(err => {
                console.log('something went wrong: ' + err);
                res.render('pages/login', {error: 'internal server error'});
            })
    
        const {user} = req.session;

        // checks authorized user group for logged in user's id
        // allows admins in regardless of group
        const userAuthorized = (user.roles && user.roles.includes("Administrators")) || groupUserIds.filter(id => id == user.userid).length > 0;
    
        res.send(userAuthorized);
    } catch (error) {
        res.sendStatus(500);
    }
})

module.exports = router;