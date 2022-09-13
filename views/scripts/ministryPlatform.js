const getEvents = (currentMonth, currentYear, redirect, LocationFilter) => { //redirect is the url after the first / defining what page will load if request fails
    let monthOffset = currentMonth - new Date().getMonth();
    let yearOffset = currentYear - new Date().getFullYear();
    
    const response = axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Events?%24filter=YEAR(Event_Start_Date)%3DYEAR(GETDATE())%2B${yearOffset}%20AND%20MONTH(Event_Start_Date)%3EMONTH(GETDATE())%2B${monthOffset-1}%20AND%20MONTH(Event_Start_Date)%3CMONTH(GETDATE())%2B${monthOffset+1}${LocationFilter ? `%20AND%20Location_ID%3D${LocationFilter}` : ''}&%24orderby=Event_Start_Date`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(response => response.data)
    .catch(err => {
        console.error(err)
        if (!redirect) {
            window.location = '/login'
        } else {
            window.location = `/login?redirect=${redirect}`
        }
    })
    return response;
}

const getEventRooms = (Event_ID) => {
    if (!Event_ID) return
    const response = axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Event_Rooms?%24filter=Event_ID%3D${Event_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(response => response.data)
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getEventRoomIDs = (Event_ID) => {
    if (!Event_ID) return
    const response = axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Event_Rooms?%24filter=Event_ID%3D${Event_ID}&%24select=Room_ID`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(response => response.data.map(room => room.Room_ID))
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getRoom = (Room_ID) => {
    if (!Room_ID) return
    const response = axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Rooms/${Room_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(response => response.data[0])
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getLocations = () => {
    const response = axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Locations`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(response => response.data.filter(location => location.Location_ID != 3))
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getLocation = (Location_ID) => {
    if (!Location_ID) return
    const response = axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Locations/${Location_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(response => {
        return response.data[0]
    })
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getLocationBuildings = (Location_ID) => {
    if (!Location_ID) return
    const response = axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Buildings?%24filter=Location_ID=${Location_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(response => {
        return response.data
    })
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getBuildingRooms = (Building_ID) => {
    if (!Building_ID) return
    const response = axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Rooms?%24filter=Building_ID=${Building_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(response => {
        return response.data
    })
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getAllUsers = () => {
    const response = axios({
        method: 'get',
        url: 'https://my.pureheart.org/ministryplatformapi/users',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
        .then(response => response.data)
        .catch(err => {
            console.error(err)
        })
    return response;
}

const getEventTypes = () => {
    const response = axios({
        method: 'get',
        url: 'https://my.pureheart.org/ministryplatformapi/tables/Event_Types',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
        .then(response => response.data)
        .catch(err => {
            console.error(err)
        })
    return response;
}

const getCongregations = () => {
    const response = axios({
        method: 'get',
        url: 'https://my.pureheart.org/ministryplatformapi/tables/Congregations',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
        .then(response => response.data.filter(congregation => !congregation.End_Date || new Date() < new Date(congregation.End_Date)))
        .catch(err => {
            console.error(err)
        })
    return response;
}

const getUserInfo = (User_ID) => {
    if (!User_ID) return
    const response = axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Contacts?%24filter=User_Account%3D${User_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(response => {
        return response.data[0]
    })
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getVisibilityLevels = () => {
    const blockedLevels = [2,3,5]
    const response = axios({
        method: 'get',
        url: 'https://my.pureheart.org/ministryplatformapi/tables/Visibility_Levels',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
        .then(response => response.data.filter(level => !blockedLevels.includes(level.Visibility_Level_ID)))
        .catch(err => {
            console.error(err)
        })
    return response;
}

const createEvent = (event) => {
    fetch('https://my.pureheart.org/ministryplatformapi/tables/Events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify(event),
    })
    .then(response => response.json())
    .catch(err => console.error(err))
}