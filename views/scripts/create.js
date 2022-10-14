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

const registrationDOM = document.querySelector('#registration');
const promotionDOM = document.querySelector('#promotion');
const AVDOM = document.querySelector('#av');
const facilitiesDOM = document.querySelector('#facilities');
const childcareDOM = document.querySelector('#childcare');

const roomSelectors = document.querySelector('.room-selectors');
const warningMsgDOM = document.querySelector('#warning-msg');
const formSections = document.querySelectorAll('.section');


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
    }).join('')
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
    }).join('')
    eventTypeDOM.value = 15; //set default value to 'class'

    //Congregation Type
    let congregationTypes = await getCongregations();
    congregationDOM.innerHTML = congregationTypes.map(congregation => {
        return `
            <option value='${congregation.Congregation_ID}'>
                ${congregation.Congregation_Name}
            </option>
        `
    }).join('')

    //Event Location
    let eventLocations = await getLocations();
    eventLocationDOM.innerHTML = eventLocations.map(location => {
        return `
            <option value='${location.Location_ID}'>
                ${location.Location_Name}
            </option>
        `
    }).join('')

    //Visibility Level
    let visibilityLevels = await getVisibilityLevels();
    visibilityLevelDOM.innerHTML = visibilityLevels.map(level => {
        return `
            <option value='${level.Visibility_Level_ID}'>
                ${level.Visibility_Level.split(' - ')[1]}
            </option>
        `
    }).join('')
}
loadForm();

let sectionId = 1;
const nextSection = async () => {
    //get the contact id from the user selected from the dropdown
    const primaryContactID = await getUserInfo(primaryContactDOM.value);
    
    //Check if all required inputs have values; if not go back and let user complete the form
    const allValues = [eventNameDOM.value,eventDescDOM.value,primaryContactID.Contact_ID,startDateDOM.value,endDateDOM.value,eventTypeDOM.value,attendanceDOM.value,congregationDOM.value,setupTimeDOM.value,cleanupTimeDOM.value,privacyDOM.value == 1 ? true : false,eventLocationDOM.value, visibilityLevelDOM.value]
    if (allValues.filter(value => value.toString() == "").length > 0) {
        sectionId = 0;
        nextSection();

        warningMsgDOM.innerText = "Not All Fields Completed"
        return;
    }
    const sections = document.querySelectorAll('.section');
    if (sectionId < sections.length) {
        sectionId ++;
        const currSection = document.querySelector(`#section-${sectionId}`);
        sections.forEach(section => {section.style.display = 'none'; section.style.visibility = 'hidden';})
        currSection.style.display = 'flex';
        currSection.style.visibility = 'visible';
    }
    warningMsgDOM.innerText = ""
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

const overlappingRoomsLoading = () => {
    loading();
    const nextBtn = document.querySelector('#next-btn');
    nextBtn.disabled = true;
}

const overlappingRoomsDone = () => {
    doneLoading();
    const nextBtn = document.querySelector('#next-btn');
    nextBtn.disabled = false;
}

const addMinutesToDate = (date, minutes) => {
    const tzOffset = 7 * 3600000;
    return new Date(new Date((date.getTime() + minutes * 60000) - tzOffset).toLocaleString()).toISOString();
}
const subtractMinutesToDate = (date, minutes) => {
    const tzOffset = 7 * 3600000;
    return new Date(new Date((date.getTime() - minutes * 60000) - tzOffset).toLocaleString()).toISOString();
}

let overlappingEventRooms = [];

const updateEventTimes = async () => {
    let startDateValue = startDateDOM.value;
    let endDateValue = endDateDOM.value;
    const setupTime = setupTimeDOM.value;
    const cleanupTime = cleanupTimeDOM.value;
    
    if (startDateValue) startDateValue = subtractMinutesToDate(new Date(startDateValue), setupTime);
    if (endDateValue) endDateValue = addMinutesToDate(new Date(endDateValue), cleanupTime);
    overlappingEventRooms = [];
    
    if (days.length) {
        overlappingRoomsLoading();

        const eventLength = new Date(endDateDOM.value).getTime() - new Date(startDateDOM.value).getTime();
        for (day of days) {
            const currEventStart = subtractMinutesToDate(new Date(day), setupTime);
            const currEventEnd = addMinutesToDate(new Date(new Date(day).getTime() + eventLength), cleanupTime);

            const overlapEvents = await getDaysEventsBetweenTimes(currEventStart, currEventEnd);
            
            for (let i = 0; i < overlapEvents.length; i ++) {
                const {Event_ID} = overlapEvents[i];
                const eventRooms = await getEventRooms(Event_ID);
                eventRooms.forEach(room => {
                    overlappingEventRooms.push(room.Room_ID)
                })
            }
        }
        overlappingEventRooms =  [...new Set(overlappingEventRooms)]

        overlappingRoomsDone();
    } else if (startDateValue && endDateValue) {
        // console.log(startDateValue, endDateValue)
        const overlapEvents = await getDaysEventsBetweenTimes(startDateValue, endDateValue);
        // const overlapEvents = [];
        
        for (let i = 0; i < overlapEvents.length; i ++) {
            const {Event_ID} = overlapEvents[i];
            const eventRooms = await getEventRooms(Event_ID);
            eventRooms.forEach(room => {
                overlappingEventRooms.push(room.Room_ID)
            })
        }
    }

    // console.log(overlappingEventRooms)
}

const resetRecurring = () => {
    days = [];
    updateEventTimes();
    const recurringLabel = document.getElementById('recurring-label');
    recurringLabel.innerText = `One Time Event`;
}

const loadRoomOptions = async () => {
    const buildingId = eventLocationDOM.value;
    let buildings = await getLocationBuildings(buildingId);
    const roomSelectorsDOM = document.getElementById('room-selectors');

    buildings = buildings.sort((a, b) => {
        let fa = a.Building_Name.toLowerCase(),
            fb = b.Building_Name.toLowerCase();
    
        if (fa < fb) {
            return -1;
        }
        if (fa > fb) {
            return 1;
        }
        return 0;
    });

    const getRoomSelectorsHTML = async () => {
        return Promise.all(buildings.map(async (building) => {
            const {Building_Name, Building_ID} = building;
            const rooms = await getBuildingRooms(Building_ID);
            if (rooms.length == 0) return;
            return `
                <div class="building">
                    <div class="building-header" onclick="toggleAccordion(${Building_ID})">
                        <p class="building-name" id="building${Building_ID}">Building ${Building_Name}</p>
                        <button type="button" class="toggle-btn"><i id="icon-${Building_ID}" class='fas fas fa-angle-down'></i></button>
                    </div>
                    <ul class="room-accordion closed" id="rooms-${Building_ID}" style="max-height: ${rooms.length * 25}px; transition: max-height ${rooms.length * 25}ms linear;">
                        ${rooms.map(room => {
                            const {Room_Name, Room_ID} = room;
                            const roomUnavailable = overlappingEventRooms.includes(Room_ID);
                            return `
                                <li id="${Room_ID}">
                                    <input type="checkbox" class="room-input" name="room-${Room_ID}" id="room-${Room_ID}" value="${Room_ID}" ${roomUnavailable ? 'disabled' : ''}>
                                    <label for="room-${Room_ID}" ${roomUnavailable ? 'style="text-decoration:line-through;"' : ''}>${Room_Name}</label>
                                </li>
                            `
                        }).join('')}
                    </ul>
                </div>
            `
        }))
    }
    const roomSelectorsHTML = await getRoomSelectorsHTML();

    roomSelectorsDOM.innerHTML = roomSelectorsHTML.join('');
}

const toggleAccordion = (buildingId) => {
    const accordion = document.getElementById(`rooms-${buildingId}`);
    const icon = document.getElementById(`icon-${buildingId}`);

    accordion.classList.toggle('closed');

    icon.classList.toggle('fa-angle-down');
    icon.classList.toggle('fa-angle-up');
}

document.getElementById('create-form').addEventListener('keypress', (e) => {
    if ((e.key == "Enter" || e.code == "Enter") && sectionId < formSections.length) {
        e.preventDefault();
        nextSection();
        loadRoomOptions();
    }
})

let roomsComplete = false;
let tasksComplete = false;

const completed = () => {
    doneLoading();
    window.location = '/calendar';
}

const publishEvent = async (event) => {

    //get an array of the rooms that were selected   
    const allRoomInputs = document.querySelectorAll('.room-input');
    const selectedRooms = [];

    for (let i = 0; i < allRoomInputs.length; i ++) {
        if (allRoomInputs[i].checked) {
            selectedRooms.push(parseInt(allRoomInputs[i].value))
        }
    }
    // console.log(selectedRooms)

    const eventId = await createEvent(event)
        .then(response => response[0].Event_ID)
        .catch(err => {
            console.error(err)
        })

    const bookAllRooms = async () => {
        for (roomId of selectedRooms) {
            const room = [{
                "Event_ID": eventId,
                "Room_ID": roomId
            }];
            await fetch('https://my.pureheart.org/ministryplatformapi/tables/Event_Rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
                body: JSON.stringify(room),
            })
            .then(response => response.json())
            .catch(err => console.error(err))
        }
    }
    await bookAllRooms()

    const taskOptions = [
        {
            taskType: "registration",
            taskOwners: registrationUserIds,
            taskDOM: registrationDOM
        },
        {
            taskType: "promotion",
            taskOwners: promotionUserIds,
            taskDOM: promotionDOM
        },
        {
            taskType: "a/v",
            taskOwners: AVUserIds,
            taskDOM: AVDOM
        },
        {
            taskType: "facilities",
            taskOwners: facilitiesUserIds,
            taskDOM: facilitiesDOM
        },
        {
            taskType: "childcare",
            taskOwners: childcareUserIds,
            taskDOM: childcareDOM
        }
    ]

    const sendAllTasks = async () => {
        for (task of taskOptions) {
            //send tasks to specific task owners for each request
            for (taskOwner of task.taskOwners) {
                if (task.taskDOM.value == 1) await sendTask(user.UserId, taskOwner, eventId, new Date().toISOString(), task.taskType)
            }
            //if event locatin is peoria, send to peoria staff
            if (eventLocationDOM.value == peoriaCampusID) {
                for (taskOwner of peoriaUserIds) {
                    if (task.taskDOM.value == 1) await sendTask(user.UserId, taskOwner, eventId, new Date().toISOString(), task.taskType)
                }
            }
            //always send to all-tasks user role 
            for (taskOwner of allTaskUserIds) {
                if (task.taskDOM.value == 1) await sendTask(user.UserId, taskOwner, eventId, new Date().toISOString(), task.taskType)
            }
        }
    }
    sendAllTasks();
}

const handleSubmit = async (e) => {
    e.preventDefault();

    //get the contact id from the user selected from the dropdown
    const primaryContactID = await getUserInfo(primaryContactDOM.value);

    //Check if all required inputs have values; if not go back and let user complete the form
    const allValues = [eventNameDOM.value,eventDescDOM.value,primaryContactID.Contact_ID,startDateDOM.value,endDateDOM.value,eventTypeDOM.value,attendanceDOM.value,congregationDOM.value,setupTimeDOM.value,cleanupTimeDOM.value,privacyDOM.value == 1 ? true : false,eventLocationDOM.value, visibilityLevelDOM.value]
    if (allValues.filter(value => value.toString() == "").length > 0) {
        sectionId = 0;
        nextSection();

        warningMsgDOM.innerText = "Not All Fields Completed"
        return;
    }
    loading();


    
    if (days.length) {
        const eventLength = new Date(endDateDOM.value).getTime() - new Date(startDateDOM.value).getTime();
        for (day of days) {
            const eventDay = new Date(new Date(day).getTime() - (new Date(day).getTimezoneOffset() * 60000))
            const event = [formatEvent(eventNameDOM.value,eventDescDOM.value,primaryContactID.Contact_ID,eventDay,new Date(new Date(eventDay).getTime() + eventLength).toISOString(),eventTypeDOM.value,attendanceDOM.value,congregationDOM.value,setupTimeDOM.value,cleanupTimeDOM.value,privacyDOM.value == 1 ? true : false,eventLocationDOM.value, visibilityLevelDOM.value)];
            await publishEvent(event)
        }
        completed();
    } else {
        //turn input data into form for sending to MP
        const event = [formatEvent(eventNameDOM.value,eventDescDOM.value,primaryContactID.Contact_ID,startDateDOM.value,endDateDOM.value,eventTypeDOM.value,attendanceDOM.value,congregationDOM.value,setupTimeDOM.value,cleanupTimeDOM.value,privacyDOM.value == 1 ? true : false,eventLocationDOM.value, visibilityLevelDOM.value)];

        await publishEvent(event)
        completed();
    }


}