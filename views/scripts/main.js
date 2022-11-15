// const registrationUserId = 9;

const user_id = getCookie('user_id');
let user_token = getCookie('access_token')
let access_token = getCookie('access_token');
let registrationUserIds,promotionUserIds,AVUserIds,facilitiesUserIds,childcareUserIds,allTaskUserIds,peoriaUserIds,peoriaAVUserIds;
const peoriaCampusID = 4;
const MP_URL = 'https://my.pureheart.org/mp';
const MP_Events_Table_ID = 308;
const onsiteFacilitiesServiceID = 17;

const getAccessToken = async () => {
    access_token = await axios({
        method: 'get',
        url: '/api/oauth/app/authorize'
    })
        .then(response => response.data.access_token)
}
getAccessToken()

const getAllTaskUsers = async () => {
    registrationUserIds = await getUsersWithRole(2194);
    promotionUserIds = await getUsersWithRole(2195);
    AVUserIds = await getUsersWithRole(2196);
    facilitiesUserIds = await getUsersWithRole(2197);
    childcareUserIds = await getUsersWithRole(2198);
    allTaskUserIds = await getUsersWithRole(2199);
    peoriaUserIds = await getUsersWithRole(2200);
    peoriaAVUserIds = await getUsersWithRole(2204);
    // registrationUserIds = [15679];
    // promotionUserIds = [15679];
    // AVUserIds = [15679];
    // facilitiesUserIds = [15679];
    // childcareUserIds = [15679];
    // allTaskUserIds = [15679];
    // peoriaUserIds = [15679];
    // peoriaAVUserIds = [15679];
}
getAllTaskUsers();


const getUser = async () => {
    return axios({
        method: 'get',
        url: '/api/oauth/me',
        params: {
            user_id: user_id,
            token: access_token
        }
    })
        .then(response => response.data)
        .then(data => data.user)
}

//5 minutes
const sessionLength = 60 * 1000 * 60;
setInterval(async () => {
    window.location = '/login'
}, sessionLength)

const sendExampleTask = async () => {
    //authorId, ownerId, eventId, startDate, taskType
    const user = await getUser();
    const {UserId} = user;

    const task = [{
        "Action": "Complete",
        "TaskName": `Example Task`,
        "Description": `This is an example task for testing purposes`,
        "StartDate": new Date().toISOString(),
        "AuthorId": new Date().toISOString(),
        "OwnerID": UserId,
        "TableName": "Events",
        "RecordId": 47864
    }]
    return fetch('https://my.pureheart.org/ministryplatformapi/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify(task),
    })
    .then(response => response.json())
    .catch(err => console.error(err))
}

const loading = () => {
    const loadingScreen = document.getElementById('loadingScreen')
    loadingScreen.style.visibility = 'visible';
    loadingScreen.style.display = 'grid';
}
const doneLoading = () => {
    const loadingScreen = document.getElementById('loadingScreen')
    loadingScreen.style.visibility = 'hidden';
    loadingScreen.style.display = 'none';
}

// toggleColorScheme();

const root = document.querySelector(':root');

const updateColorScheme = () => {
    var colorScheme = localStorage.getItem('colorScheme');
    if (colorScheme == 'light') {
        root.style.setProperty('--backgroundColor', '#e0dcdc');
        root.style.setProperty('--primary-font-color', '#17161d');
        root.style.setProperty('--secondary-font-color', '#f1f2f6');
        root.style.setProperty('--primary-bg-color', '#cdc3c3');
        root.style.setProperty('--secondary-bg-color', '#9f9696');
        root.style.setProperty('--red-accent-color', '#e74c3c');
        root.style.setProperty('--blue-accent-color', '#3498db');
        root.style.setProperty('--blue-accent-color2', '#2980b9');
        root.style.setProperty('--arrow-button-color', '#b2bec3');
    } else if (colorScheme == 'dark') {
        root.style.setProperty('--backgroundColor', 'hsl(200, 4%, 14%)');
        root.style.setProperty('--primary-font-color', '#f1f2f6');
        root.style.setProperty('--secondary-font-color', '#17161d');
        root.style.setProperty('--primary-bg-color', 'hsl(0, 1%, 21%)');
        root.style.setProperty('--secondary-bg-color', 'hsl(0, 1%, 36%)');
        root.style.setProperty('--red-accent-color', '#e74c3c');
        root.style.setProperty('--blue-accent-color', '#3498db');
        root.style.setProperty('--blue-accent-color2', '#2980b9');
        root.style.setProperty('--arrow-button-color', 'gray');
    } else {
        localStorage.setItem('colorScheme', 'light');
        updateColorScheme();
    }
}
updateColorScheme();

const toggleColorScheme = () => {
    var colorScheme = localStorage.getItem('colorScheme');  

    if (colorScheme == 'light') {
        localStorage.setItem('colorScheme', 'dark');
    } else {
        localStorage.setItem('colorScheme', 'light');
    }
    updateColorScheme();
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

function abbrNum(number, decPlaces) {
    // 2 decimal places => 100, 3 => 1000, etc
    decPlaces = Math.pow(10,decPlaces);

    number = parseFloat(number.toFixed(2))

    // Enumerate number abbreviations
    var abbrev = [ "k", "m", "b", "t" ];

    // Go through the array backwards, so we do the largest first
    for (var i=abbrev.length-1; i>=0; i--) {

        // Convert array index to "1000", "1000000", etc
        var size = Math.pow(10,(i+1)*3);

        // If the number is bigger or equal do the abbreviation
        if(size <= number) {
             // Here, we multiply by decPlaces, round, and then divide by decPlaces.
             // This gives us nice rounding to a particular decimal place.
             number = Math.round(number*decPlaces/size)/decPlaces;

             // Add the letter for the abbreviation
             number += abbrev[i];

             // We are done... stop
             break;
        }
    }
    return number;
}

function logout() {
    //remove all cookies
    document.cookie = "user_id= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "access_token= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";

    window.location = '/'
}