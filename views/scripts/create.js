const eventCreatorDOM = document.querySelector('#event-creator');
const eventNameDOM = document.querySelector('#event-name')
const eventDescDOM = document.querySelector('#event-desc');
const primaryContactDOM = document.querySelector('#primary-contact');
const startDateDOM = document.querySelector('#start-date');
const endDateDOM = document.querySelector('#end-date')
const eventTypeDOM = document.querySelector('#event-type');
const attendanceDOM = document.querySelector('#attendance')
const congregationDOM = document.querySelector('#congregation');
const setupTimeDOM = document.querySelector('#setup');
const cleanupTimeDOM = document.querySelector('#cleanup');
const privacyDOM = document.querySelector('#privacy');
const eventLocationDOM = document.querySelector('#event-location');
const visibilityLevelDOM = document.querySelector('#visibility');

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

    //Visibility Level
    let visibilityLevels = await getVisibilityLevels();
    visibilityLevelDOM.innerHTML = visibilityLevels.map(level => {
        return `
            <option value='${level.Visibility_Level_ID}'>
                ${level.Visibility_Level.split(' - ')[1]}
            </option>
        `
    })
}
loadForm();

let sectionId = 1;
const nextSection = () => {
    const sections = document.querySelectorAll('.section');
    if (sectionId < sections.length) {
        sectionId ++;
        const currSection = document.querySelector(`#section-${sectionId}`);
        sections.forEach(section => {section.style.display = 'none'; section.style.visibility = 'hidden';})
        currSection.style.display = 'flex';
        currSection.style.visibility = 'visible';
    }
}

const prevSection = () => {
    const sections = document.querySelectorAll('.section');
    if (sectionId > 0) {
        sectionId --;
        const currSection = document.querySelector(`#section-${sectionId}`);
        sections.forEach(section => {section.style.display = 'none'; section.style.visibility = 'hidden';})
        currSection.style.display = 'flex';
        currSection.style.visibility = 'visible';
    }
}

const handleSubmit = async (e) => {
    e.preventDefault();

    //get the contact id from the user selected from the dropdown
    const primaryContactID = await getUserInfo(primaryContactDOM.value);

    const event = formatEvent(eventNameDOM.value,eventDescDOM.value,primaryContactID.Contact_ID,startDateDOM.value,endDateDOM.value,eventTypeDOM.value,attendanceDOM.value,congregationDOM.value,setupTimeDOM.value,cleanupTimeDOM.value,privacyDOM.value == 1 ? true : false,eventLocationDOM.value, visibilityLevelDOM.value);

    createEvent([event]);
}