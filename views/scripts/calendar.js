const calenderDOM = document.getElementById('calender');
const dateLabel = document.getElementById('date-label');

const calendarFilterDOM = document.getElementById('filter')

const maxEvents = 21;

const getMonth = (year, month) => {
    const date = new Date(year, month, 1);

    const datesArray = [];

    while (date.getMonth() === month) {
        const dateItem = {
            day: new Date(date).toDateString(),
            weekday: date.getDay(),
            monthday: date.getDate(),
            numberOfEvents: 0
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
            numberOfEvents: 0
        }
        datesArray.unshift(dateItem)
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

function drawCalender() {
    dateLabel.innerHTML = `${toMonthName(currentMonth)} ${currentYear}`;

    let calenderHTML = '';

    for (var i=0; i < dates.length; i++) {
        const date = dates[i];

        const eventFull = Math.floor((date.numberOfEvents / maxEvents) * 100);

        let dateHTML = `
            <div class='calender-day ${date.numberOfEvents >= 1 ? 'event' : ''}' onClick='popup("${date.day}", ${date.numberOfEvents})'>
                <p>${date.monthday}</p>
                ${date.numberOfEvents > 0 ? `<p class='eventsNumber'>${date.numberOfEvents} ${date.numberOfEvents > 1 ? 'Events' : 'Event'}</p>` : ''}
                <div class="progressBar" style="width: ${eventFull}%"></div>
            </div>
        `
        calenderHTML += dateHTML;
    }
    calenderDOM.innerHTML = calenderHTML;

}
drawCalender();

function getEventsFromDay(day) {
    // const daySimplified = day.toDateString();

    let daysEvents = events.filter(event => new Date(event.Event_Start_Date).toDateString() == day && !event.Cancelled)
    
    return daysEvents;
}

function toMonthName(monthNumber) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[monthNumber]
}