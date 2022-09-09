const calenderDOM = document.getElementById('calender');
const dateLabel = document.getElementById('date-label');

const calendarFilterDOM = document.getElementById('filter')
const buildingFilterDOM = document.getElementById('building-filter');
const roomFilterDOM = document.getElementById('room-filter');

const maxEvents = 21;

let allEvents;
let events;

let locationDetails = [];

let locationsList = [];
let buildingsList = [];
let roomsList = [];
const getLocationDetails = async () => {
    locationsList = await getLocations();

    for (let i = 0; i < locationsList.length; i ++) {
        buildingsList.push({
            Location_ID: locationsList[i].Location_ID,
            buildings: await getLocationBuildings(locationsList[i].Location_ID)
        })
    }
    for (let i = 0; i < buildingsList.length; i ++) {
        for (let j = 0; j < buildingsList[i].buildings.length; j ++) {
            roomsList.push({
                Building_ID: buildingsList[i].buildings[j].Building_ID,
                rooms: await getBuildingRooms(buildingsList[i].buildings[j].Building_ID)
            })
        }
    }
}
getLocationDetails();

const getMonth = (year, month) => {
    const date = new Date(year, month, 1);
    console.log(year, month)

    const datesArray = [];

    while (date.getMonth() === month) {
        const dateItem = {
            day: new Date(date).toDateString(),
            weekday: date.getDay(),
            monthday: date.getDate(),
            numberOfEvents: 0,
            active: true
        }
        datesArray.push(dateItem);
        date.setDate(date.getDate() + 1);
    }
    
    const firstDate = datesArray[0];
    let prevDay = new Date(new Date(firstDate.day));

    for (let i = 0; i < firstDate.weekday; i ++) {
        prevDay = new Date(prevDay - (1000*60*60*24));
        
        const dateItem = {
            day: prevDay.toDateString(),
            weekday: prevDay.getDay(),
            monthday: prevDay.getDate(),
            numberOfEvents: 0,
            active: true
        }
        datesArray.unshift(dateItem)
    }

    const lastDate = datesArray[datesArray.length - 1]
    let nextDate = new Date(new Date(lastDate.day));

    for (let i = 0; i < (6 - lastDate.weekday); i ++) {
        nextDate.setDate(nextDate.getDate()+1);

        const dateItem = {
            day: nextDate.toDateString(),
            weekday: nextDate.getDay(),
            monthday: nextDate.getDate(),
            numberOfEvents: 0,
            active: false
        }
        datesArray.push(dateItem)
    }

    // console.log(datesArray)
    return datesArray;
}
let today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();

let dates = getMonth(currentYear, currentMonth)

const getFilters = async () => {
    calendarFilterDOM.innerHTML = '';
    await getLocations()
        .then((locations) => {
            const locationsFilterHTML = locations.map(location => {
                const {Location_ID, Location_Name, Move_In_Date} = location;
                return `
                    <option value="${Location_ID}">
                        ${Location_Name}
                    </option>
                `
            })
            locationsFilterHTML.unshift(`
                <option value="0">
                    All
                </option>
            `)
            calendarFilterDOM.innerHTML = locationsFilterHTML.join('');
        })
}
getFilters();

const getBuildingFilters = async (Location_ID) => {
    buildingFilterDOM.innerHTML = '';
    await getLocationBuildings(Location_ID)
        .then(buildings => {
            const buildingFilterHTML = buildings.map(building => {
                const {Building_ID, Building_Name} = building;
                return `
                    <option value="${Building_ID}">
                        ${Building_Name}
                    </option>
                `
            })
            buildingFilterHTML.unshift(`
                <option value="0">
                    All
                </option>
            `)
            buildingFilterDOM.innerHTML = buildingFilterHTML.join('')
        })
}

const getRoomFilters = async (Building_ID) => {
    roomFilterDOM.innerHTML = '';
    await getBuildingRooms(Building_ID)
        .then(rooms => {
            const roomFilterHTML = rooms.map(room => {
                const {Room_ID, Room_Name} = room;
                return `
                    <option value="${Room_ID}">
                        ${Room_Name}
                    </option>
                `
            })
            roomFilterHTML.unshift(`
                <option value="0">
                    All
                </option>
            `)
            roomFilterDOM.innerHTML = roomFilterHTML.join('')
        })
}

function drawCalendar() {
    dateLabel.innerHTML = `${toMonthName(currentMonth)} ${currentYear}`;
    dateLabel.onclick = () => datePicker(currentYear, currentMonth)

    let calenderHTML = '';

    for (var i=0; i < dates.length; i++) {
        const date = dates[i];

        const eventFull = Math.floor((date.numberOfEvents / maxEvents) * 100);

        let dateHTML = `
            <div class='calender-day ${date.numberOfEvents >= 1 ? 'event' : ''} ${!date.active ? 'inactive' : ''}' ${date.numberOfEvents > 0 ? `onClick='popup("${date.day}", ${date.numberOfEvents})'` : ''}>
                <p>${date.monthday}</p>
                ${date.numberOfEvents > 0 ? `<p class='eventsNumber'>${date.numberOfEvents} ${date.numberOfEvents > 1 ? 'Events' : 'Event'}</p>` : ''}
                <div class="progressBar" style="max-width: ${eventFull}%"></div>
            </div>
        `
        calenderHTML += dateHTML;
    }
    calenderDOM.innerHTML = calenderHTML;

}
drawCalendar();

function getEventsFromDay(day) {
    // const daySimplified = day.toDateString();

    let daysEvents = events.filter(event => new Date(event.Event_Start_Date).toDateString() == day && !event.Cancelled)
    
    return daysEvents;
}

function toMonthName(monthNumber) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[monthNumber]
}