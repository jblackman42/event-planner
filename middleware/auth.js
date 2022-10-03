const { default: axios } = require("axios");

//used for basic pages
const ensureAuthenticated = async (req,res,next) => {
    const {user_id, access_token} = req.cookies;
    if (!user_id || !access_token) return res.render('pages/login', {error: null})
    
    return axios({
        method: 'get',
        url: `${process.env.DOMAIN_NAME}/api/oauth/me/roles`,
        params: {
            user_id: user_id,
            token: access_token
        }
    })
        .then(response => response.data)
        .then(data => {
            const {userRoles} = data;
            const requiredRoles = [19, 39]//array of roles that will allow user to log in

            if (!userRoles) return res.render('pages/login', {error: "Session Expired"});
            
            if (userRoles.filter(role => requiredRoles.includes(role.Role_ID)).length > 0) next();
            else res.render('pages/calendar')
        })
        .catch(err => {
            console.log(err)
            res.render('pages/login', {error: "Session Expired"})
        })
}

//used for admin pages
const ensureAdminAuthenticated = async (req, res, next) => {
    const {user_id, access_token} = req.cookies;
    if (!user_id || !access_token) return res.render('pages/login', {error: null})
    
    return axios({
        method: 'get',
        url: `${process.env.DOMAIN_NAME}/api/oauth/me/roles`,
        params: {
            user_id: user_id,
            token: access_token
        }
    })
        .then(response => response.data)
        .then(data => {
            const {userRoles} = data;
            const requiredRoles = [2202, 2]//array of roles that will allow user to log in and create events

            if (!userRoles) return res.render('pages/login', {error: "Session Expired"});
            
            if (userRoles.filter(role => requiredRoles.includes(role.Role_ID)).length > 0) next();
            else res.render('pages/calendar')
        })
        .catch(err => {
            console.log(err)
            res.render('pages/login', {error: "Session Expired"})
        })
}

const ensureAdministrator = async (req, res, next) => {
    const {user_id, access_token} = req.cookies;
    if (!user_id || !access_token) return res.render('pages/login', {error: null})
    
    return axios({
        method: 'get',
        url: `${process.env.DOMAIN_NAME}/api/oauth/me/roles`,
        params: {
            user_id: user_id,
            token: access_token
        }
    })
        .then(response => response.data)
        .then(data => {
            const {userRoles} = data;
            const requiredRoles = [2]//array of roles that will allow user to log in and create events

            if (!userRoles) return res.render('pages/login', {error: "Session Expired"});
            
            if (userRoles.filter(role => requiredRoles.includes(role.Role_ID)).length > 0) next();
            else res.redirect('/')
        })
        .catch(err => {
            console.log(err)
            res.render('pages/login', {error: "Session Expired"})
        })
}
  
module.exports = {
    ensureAuthenticated,
    ensureAdminAuthenticated,
    ensureAdministrator
};;