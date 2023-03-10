const axios = require('axios');
const qs = require('qs');

const ensureAuthenticated = async (req, res, next) => {
    const logging = 0;

    const {user, access_token, refresh_token} = req.session;

    if (!user || !access_token) {
        if (logging) console.log('no token')
        // kick em out
        return res.render('pages/login', {error: ''});
    };

    // checks if current access token is valid
    const isValid = await axios({
        method: 'post',
        url: `${process.env.BASE_URL}/oauth/connect/accesstokenvalidation`,
        data: qs.stringify({
            'token': req.session.access_token
        })
    })
        .then(response => {
            const {exp} = response.data;
            return new Date() < new Date(exp * 1000)
        })
        .catch(err => {
            // console.log(err)
            return false;
        })

    if (isValid) {
        if (logging) console.log('valid token')
        return next()
    };
    if (logging) console.log('invalid token')
    // if token is not valid, use refresh token to get a new one
    
    const newAccessToken = await axios({
        method: 'post',
        url: `${process.env.BASE_URL}/oauth/connect/token`,
        headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')}`
        },
        data: qs.stringify({
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token
        })
    })
        .then(response => response.data.access_token)
        .catch(err => {
            console.log('something went wrong: ' + err);
            return false;
        })

    if (logging) console.log('new token')

    if (newAccessToken) {
        req.session.access_token = newAccessToken;
        return next();
    } else {
        return res.render('pages/login', {error: 'internal server error'})
    }
}

const checkUserGroups = async (req, res, next) => {
    const data = await axios({
        method: 'post',
        url: `${process.env.BASE_URL}/oauth/connect/token`,
        data: qs.stringify({
            grant_type: "client_credentials",
            scope: "http://www.thinkministry.com/dataplatform/scopes/all",
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET
        })
    })
        .then(response => response.data)
    const {access_token} = data;

    const groupUserIds = await axios({
        method: 'get',
        url: `${process.env.BASE_URL}/tables/dp_User_User_Groups?$filter=User_Group_ID=${process.env.AUTHORIZED_USER_GROUP_ID}`,
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
    const userAuthorized = groupUserIds.filter(id => id == user.userid).length > 0 || (user.roles && user.roles.includes("Administrators"));
    
    // if user IS a part of authorized group
    // let em in
    if (userAuthorized) return next();
    // if user is not a part of authorized group
    // kick em out
    req.session.user = null;
    req.session.access_token = null;
    req.session.refresh_token = null;
    return res.render('pages/login', {error: 'unauthorized'})
}

module.exports = {
    ensureAuthenticated,
    checkUserGroups,
}