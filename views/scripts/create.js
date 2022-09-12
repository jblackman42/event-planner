const eventCreatorDOM = document.querySelector('#event-creator');
const primaryContactDOM = document.querySelector('#primary-contact');
const eventTypeDOM = document.querySelector('#event-type');
const congregationDOM = document.querySelector('#congregation');
const eventLocationDOM = document.querySelector('#event-location');

let user;
const loadForm = async () => {
    //logged in user
    user = await getUser();
    //displays the logged in user as the event creator
    eventCreatorDOM.innerText = user.DisplayName.split(', ').reverse().join(' ');

    //Primary Contact
    let allUsers = await getAllUsers();
    const blockedUserIDs = [14881,14746,10925,9709,9504,9429,9229,9092,6908,6580,5,2,1]
    allUsers = allUsers.filter(user => !blockedUserIDs.includes(user.Id))
    allUsers = allUsers.sort((a, b) => {
        let fa = a.Name.split(', ')[0].toLowerCase(),
            fb = b.Name.split(', ')[0].toLowerCase();
    
        if (fa < fb) {
            return -1;
        }
        if (fa > fb) {
            return 1;
        }
        return 0;
    });

    primaryContactDOM.innerHTML = allUsers.map(userInfo => {
        return `
            <option value='${userInfo.Id}'>
                ${userInfo.Name}
            </option>
        `
    })
    primaryContactDOM.value = user.UserId;

    //Event Types
    let eventTypes = await getEventTypes();
    eventTypes = eventTypes.sort((a, b) => {
        let fa = a.Event_Type.toLowerCase(),
            fb = b.Event_Type.toLowerCase();
    
        if (fa < fb) {
            return -1;
        }
        if (fa > fb) {
            return 1;
        }
        return 0;
    });

    eventTypeDOM.innerHTML = eventTypes.map(type => {
        return `
            <option value='${type.Event_Type_ID}'>
                ${type.Event_Type}
            </option>
        `
    })
    eventTypeDOM.value = 15; //set default value to 'class'

    //Congregation Type
    let congregationTypes = await getCongregations();
    congregationDOM.innerHTML = congregationTypes.map(congregation => {
        return `
            <option value='${congregation.Congregation_ID}'>
                ${congregation.Congregation_Name}
            </option>
        `
    })

    //Event Location
    let eventLocations = await getLocations();
    eventLocationDOM.innerHTML = eventLocations.map(location => {
        return `
            <option value='${location.Location_ID}'>
                ${location.Location_Name}
            </option>
        `
    })
}
loadForm();

const handleSubmit = async (e) => {
    e.preventDefault();
}