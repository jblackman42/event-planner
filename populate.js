const prayers = require('./prayers.json');
const qs = require('qs');
const axios = require('axios');

const populate = async () => {
    // get access token
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

    // loop through all prayers
    // prayers.length = 1;
    let count = 0;

    for (const prayer of prayers) {
        const { Name, Date: DateTime, Email, 'Prayer Request': Request } = prayer;
        const prayerDate = new Date(DateTime);
        await axios({
            method: 'post',
            url: 'https://my.pureheart.org/ministryplatformapi/tables/Prayer_Requests',
            data: [{
                "Author_Name": Name,
                "Author_Email": Email,
                "Date_Created": prayerDate.toISOString(),
                "Prayer_Body": Request,
                "Prayer_Status_ID": 2,
                "Prayer_Count": 0,
                "Private": 0,
                "Prayer_Notify": 0,
                "Notification_Schedules": 0
            }],
            headers: {
                'content-type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        })
        .then(response => {
            count ++;
            console.log(`${count} / ${prayers.length}`)
        })
    }

    // post all prayers into mp

    // win
}
module.exports = {
    populate
};