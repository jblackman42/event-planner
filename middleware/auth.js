const { default: axios } = require("axios");

const ensureAuthenticated = async (req,res,next) => {
    const {user_id, access_token} = req.cookies;
    if (!user_id || !access_token) res.render('pages/login', {error: null})

    const user = axios({
        method: 'get',
        url: 'http://localhost:3000/api/oauth/me',
        params: {
            user_id: user_id,
            token: access_token
        }
    })
        .then(response => response.data.user)
        .catch(err => {
            console.error(err)
            res.render('pages/login', {error: null})
        })
    
    return await user
        .then(user => {
            if (!user) {
                return;
            }

            const {User_Roles} = user;
            const requiredRoles = [19]

            // console.log(User_Roles)
            //somewhere here i will verify the user has the correct roles
            

            if (User_Roles.filter(role => requiredRoles.includes(role.Role_ID)).length >= 1) return next();
            return res.render('pages/login', {error: "insufficient rights"})
        })
  }
  
  module.exports = {ensureAuthenticated};;