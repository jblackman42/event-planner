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

const getDaysEventsBetweenTimes = (startTime, endTime) => {
    const response = axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Events?$filter='${startTime}' BETWEEN Event_Start_Date AND Event_End_Date OR '${endTime}' BETWEEN Event_Start_Date AND Event_End_Date OR Event_Start_Date BETWEEN '${startTime}' AND '${endTime}' OR Event_End_Date BETWEEN '${startTime}' AND '${endTime}'`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(response => response.data.filter(event => !event.Cancelled))
    .catch(err => {console.error(err)})
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

const getEventRoomsFromIDs = (Event_IDs, Room_ID) => {
    if (!Event_IDs || !Room_ID) return
    const response = axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Event_Rooms?%24filter=Room_ID = ${Room_ID} AND Event_ID BETWEEN ${Event_IDs[0]} AND ${Event_IDs[Event_IDs.length - 1]}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(response => response.data.map(event => event.Event_ID))
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getEventRoomsForBuilding = (Event_IDs, Room_IDs, skip) => {
    if (!Event_IDs || !Room_IDs) return
    const response = axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Event_Rooms?${skip ? `$skip=${skip}&` : ''}%24filter=${Room_IDs.map(id => `Room_ID=${id} AND Event_ID BETWEEN ${Event_IDs[0]} AND ${Event_IDs[Event_IDs.length - 1]}`).join(' OR ')}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(response => response.data.map(event => event.Event_ID))
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
    const blockekdLocations = [3,6]
    const response = axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Locations`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(response => response.data.filter(location => !blockekdLocations.includes(location.Location_ID)))
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
        url: `https://my.pureheart.org/ministryplatformapi/tables/Rooms?%24filter=Building_ID=${Building_ID} AND Bookable='true'`,
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

const getUsersWithRole = (Role_ID) => {
    if (!Role_ID) return
    const response = axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/dp_User_Roles?$select=User_ID&$filter=Role_ID=${Role_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(response => {
        return response.data.map(user => user.User_ID)
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

const createEvent = async (event) => {
    return fetch('https://my.pureheart.org/ministryplatformapi/tables/Events', {
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

const sendTask = async (authorId, ownerId, eventId, startDate, taskType) => {
    const task = [{
        "Action": "Complete",
        "TaskName": `Task ${taskType}`,
        "Description": `The attatched event has requested ${taskType}.`,
        "StartDate": startDate,
        "AuthorId": authorId,
        "OwnerID": ownerId,
        "TableName": "Events",
        "RecordId": eventId
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

const sendRecurringEventTask = async (authorId, ownerId, eventId, startDate, instructions) => {
    const task = [{
        "Action": "Complete",
        "TaskName": `Setup Recurring Event`,
        "Description": `${instructions}.`,
        "StartDate": startDate,
        "AuthorId": authorId,
        "OwnerID": ownerId,
        "TableName": "Events",
        "RecordId": eventId
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