const getEvents = (redirect) => { //redirect is the url after the first / defining what page will load if request fails
    const response = axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/events?%24orderby=Event_Start_Date%20DESC${iteration > 0 ? `&%24skip=${600 * iteration}` : ''}`,
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

const getRoom = (Room_ID) => {
    if (!Room_ID) return
    const response = axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Rooms?%24filter=Room_ID%3D${Room_ID}`,
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