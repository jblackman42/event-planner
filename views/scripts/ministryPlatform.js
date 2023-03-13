const getEvents = async (currentMonth, currentYear) => { //redirect is the url after the first / defining what page will load if request fails
    const firstOfMonth = new Date(currentYear, currentMonth, 1);
    const firstVisibleDate = new Date(currentYear, currentMonth, 1 - firstOfMonth.getDay())
    const lastVisibleDate = new Date(currentYear, currentMonth + 1, 0)
    lastVisibleDate.setTime(lastVisibleDate.getTime() + 86399999)
    
    const response = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Events?$filter=Event_Start_Date BETWEEN '${firstVisibleDate.toISOString()}' AND '${lastVisibleDate.toISOString()}'`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data)
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getEvent = async (Event_ID) => {
    if (!Event_ID) return
    const response = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Events/${Event_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data[0])
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getContactFromID = async (Contact_ID) => {
    //https://my.pureheart.org/ministryplatformapi/tables/Contacts
    if (!Contact_ID) return
    const response = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Contacts/${Contact_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data[0])
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getDaysEventsBetweenTimes = async (startTime, endTime) => {
    const response = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Events?$filter='${startTime}' BETWEEN Event_Start_Date AND Event_End_Date OR '${endTime}' BETWEEN Event_Start_Date AND Event_End_Date OR Event_Start_Date BETWEEN '${startTime}' AND '${endTime}' OR Event_End_Date BETWEEN '${startTime}' AND '${endTime}'`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data.filter(event => !event.Cancelled))
    .catch(err => {console.error(err)})
    return response;
}

const getPrograms = async () => {
    const response = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Programs`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data)
    .catch(err => {console.error(err)})
    return response;
}

const getEventRooms = async (Event_ID) => {
    if (!Event_ID) return
    const response = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Event_Rooms?%24filter=Event_ID%3D${Event_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data)
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getEventRoomsFromIDs = async (Event_IDs, Room_ID) => {
    if (!Event_IDs || !Room_ID) return
    const response = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Event_Rooms?%24filter=Room_ID = ${Room_ID} AND Event_ID BETWEEN ${Event_IDs[0]} AND ${Event_IDs[Event_IDs.length - 1]}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data.map(event => event.Event_ID))
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getBuilding = async (Building_ID) => {
    if (!Building_ID) return
    const response = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Buildings/${Building_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data[0])
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getEventRoomsForBuilding = async (Event_IDs, Room_IDs, skip) => {
    if (!Event_IDs || !Room_IDs) return
    const response = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Event_Rooms?${skip ? `$skip=${skip}&` : ''}%24filter=${Room_IDs.map(id => `Room_ID=${id} AND Event_ID BETWEEN ${Event_IDs[0]} AND ${Event_IDs[Event_IDs.length - 1]}`).join(' OR ')}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data.map(event => event.Event_ID))
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getEventRoomIDs = async (Event_ID) => {
    if (!Event_ID) return
    const response = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Event_Rooms?%24filter=Event_ID%3D${Event_ID}&%24select=Room_ID`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data.map(room => room.Room_ID))
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getRoom = async (Room_ID) => {
    if (!Room_ID) return
    const response = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Rooms/${Room_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data[0])
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getLocations = async () => {
    const blockekdLocations = [3,6]
    const response = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Locations`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data.filter(location => !blockekdLocations.includes(location.Location_ID)))
    .catch(err => {
        console.error(err)
    })
    return response;
}

const getLocation = async (Location_ID) => {
    if (!Location_ID) return
    const response = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Locations/${Location_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
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

const getLocationBuildings = async (Location_ID) => {
    if (!Location_ID) return
    const response = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Buildings?%24filter=Location_ID=${Location_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
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

const getBuildingRooms = async (Building_ID) => {
    if (!Building_ID) return
    const response = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Rooms?%24filter=Building_ID=${Building_ID} AND Bookable='true'`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
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

const getAllUsers = async () => {
    const response = await axios({
        method: 'get',
        url: 'https://my.pureheart.org/ministryplatformapi/users',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
        .then(response => response.data)
        .catch(err => {
            console.error(err)
        })
    return response;
}

const getEventTypes = async () => {
    const response = await axios({
        method: 'get',
        url: 'https://my.pureheart.org/ministryplatformapi/tables/Event_Types',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
        .then(response => response.data)
        .catch(err => {
            console.error(err)
        })
    return response;
}

const getCongregations = async () => {
    const response = await axios({
        method: 'get',
        url: 'https://my.pureheart.org/ministryplatformapi/tables/Congregations',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
        .then(response => response.data.filter(congregation => !congregation.End_Date || new Date() < new Date(congregation.End_Date)))
        .catch(err => {
            console.error(err)
        })
    return response;
}

const getUserInfo = async (User_ID) => {
    if (!User_ID) return
    const response = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Contacts?%24filter=User_Account%3D${User_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
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

const getUserTasks = async (User_ID) => {
    if (!User_ID) return;
    return await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/dp_Tasks?$filter=Assigned_User_ID=${User_ID} AND Completed=0`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data)
    .catch(err => console.error(err))
}

const deleteTask = async (TaskId) => {
    if (!TaskId) return;
    return await axios({
        method: 'delete',
        url: `https://my.pureheart.org/ministryplatformapi/tasks/${TaskId}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getClientAccessToken()}`
        }
    })
    .then(response => response)
    .catch(err => err)
}

const getUsersWithRole = async (Role_ID) => {
    if (!Role_ID) return
    const response = await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/dp_User_Roles?$select=User_ID&$filter=Role_ID=${Role_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
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

const getVisibilityLevels = async () => {
    const blockedLevels = [2,3,5]
    const response = await axios({
        method: 'get',
        url: 'https://my.pureheart.org/ministryplatformapi/tables/Visibility_Levels',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
        .then(response => response.data.filter(level => !blockedLevels.includes(level.Visibility_Level_ID)))
        .catch(err => {
            console.error(err)
        })
    return response;
}

const getEquipment = async () => {
    return await axios({
        method: 'get',
        url: 'https://my.pureheart.org/ministryplatformapi/tables/Equipment?$filter=Bookable=1',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
        .then(response => response.data)
        .catch(err => {
            console.error(err)
        })
}

const createEvent = async (event) => {
    return fetch('https://my.pureheart.org/ministryplatformapi/tables/Events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        },
        body: JSON.stringify(event),
    })
    .then(response => response.json())
    .catch(err => console.error(err))
}

const addAPIUserToEvent = async (Event_ID) => {
    const eventParticipant = [{
        "Event_ID": Event_ID,
        "Participant_ID": 116075,
        "Participation_Status_ID": 5
    }]
    return fetch('https://my.pureheart.org/ministryplatformapi/tables/Event_Participants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        },
        body: JSON.stringify(eventParticipant),
    })
    .then(response => response.json())
    .catch(err => console.error(err))
}

const sendTask = async (authorId, ownerId, eventId, startDate, taskType) => {
    const task = [{
        "Action": "Complete",
        "TaskName": `${taskType ? `Task ${taskType}` : 'Event Created'}`,
        "Description": `${taskType ? `The attatched event has requested ${taskType}. Please contact the event creator or event's primary contact to set up ${taskType} for this event. Thank You!` : 'A new event has been created, Please contact the event creator or event\'s primary contact if necessary.'}`,
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
            'Authorization': `Bearer ${await getAccessToken()}`
        },
        body: JSON.stringify(task),
    })
    .then(response => response.data)
    .catch(err => console.error(err))
}

const getEquipmentReservations = async (Event_ID) => {
    if (!Event_ID) return;
    return await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Event_Equipment?$filter=Event_ID=${Event_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data)
    .catch(err => console.error(err)) 
}

const getService = async (Service_ID) => {
    if (!Service_ID) return;
    return await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Servicing/${Service_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data[0])
    .catch(err => console.error(err)) 
}

const getServiceReservations = async (Event_ID) => {
    if (!Event_ID) return;
    return await axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Event_Services?$filter=Event_ID=${Event_ID}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data)
    .catch(err => console.error(err)) 
}

const createEquipmentReservation = async (Event_ID, Equipment_ID, Quantity) => {
    const reservation = [{
        "Event_ID": Event_ID,
        "Equipment_ID": Equipment_ID,
        "Room_ID": null,
        "Quantity": Quantity,
        "Desired_Placement_or_Location": null,
        "_Approved": false,
        "Cancelled": false,
        "Notes": ""
    }]

    return await axios({
        method: 'post',
        url: 'https://my.pureheart.org/ministryplatformapi/tables/Event_Equipment',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        },
        data: JSON.stringify(reservation)
    })
    .then(response => response.data)
    .catch(err => console.error(err)) 
}

const createServiceReservation = async (Event_ID, Service_ID) => {
    const reservation = [{
        "Event_ID": Event_ID,
        "Service_ID": Service_ID,
        "Quantity": 1,
        "Location_For_Service": null,
        "Notes": null,
        "Cancelled": false,
        "_Approved": false
    }]

    return await axios({
        method: 'post',
        url: 'https://my.pureheart.org/ministryplatformapi/tables/Event_Services',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        },
        data: JSON.stringify(reservation)
    })
    .then(response => response.data)
    .catch(err => console.error(err)) 
}

const getPageID = async (Table_Name) => {
    if (!Table_Name) return;
    return await axios({
        method: 'post',
        url: `https://my.pureheart.org/ministryplatformapi/procs/api_Common_GetPageID`,
        data: {
            "@TableName": Table_Name
        },
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data[0][0])
    .catch(err => console.error(err))
}
const getProcs = async () => {
    return await axios({
        method: 'get',
        url: 'https://my.pureheart.org/ministryplatformapi/procs',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        }
    })
    .then(response => response.data)
    .catch(err => {console.error(err)})
}

const getMonthsDonations = async (year, month) => {
    if (!year || !month) return;
    const getDonations = async (skip) => {
        return await axios({
            method: 'get',
            url: `https://my.pureheart.org/ministryplatformapi/tables/Donations?$filter=MONTH(Donation_Date) = ${month} AND Year(Donation_Date) = ${year}${skip ? `&$skip=${skip}` : ''}`,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${await getAccessToken()}`
            }
        })
        .then(response => response.data)
        .catch(err => console.error(err))
    }
    let complete = false;
    let donations = [];
    let iterationCount = 0;
    while (!complete) {
        const currDonations = await getDonations(iterationCount * 1000)
        // console.log(currDonations)
        donations = donations.concat(currDonations)

        if (currDonations.length < 1000) complete = true;

        iterationCount ++;
    }
    return donations
}