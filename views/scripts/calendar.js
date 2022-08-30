const calenderDOM = document.getElementById('calender');
const dateLabel = document.getElementById('date-label');

const getMonth = (year, month) => {
    const date = new Date(year, month, 1);

    const dates = [];

    while (date.getMonth() === month) {
        const dateItem = {
            day: new Date(date).toDateString(),
            weekday: date.getDay(),
            monthday: date.getDate(),
            numberOfEvents: 0
        }
        dates.push(dateItem);
        date.setDate(date.getDate() + 1);
    }

    const firstDate = dates[0];
    let prevDay = new Date(new Date(firstDate.day));

    for (let i = 0; i < firstDate.weekday; i ++) {
        prevDay = new Date(prevDay - (1000*60*60*24));
        
        const dateItem = {
            day: prevDay.toDateString(),
            weekday: prevDay.getDay(),
            monthday: prevDay.getDate(),
            numberOfEvents: 0
        }
        dates.unshift(dateItem)
    }

    return dates;
}
let today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();

let dates = getMonth(currentYear, currentMonth)

function drawCalender() {
    dateLabel.innerHTML = `${toMonthName(currentMonth)} ${currentYear}`

    let calenderHTML = '';

    for (var i=0; i < dates.length; i++) {
        const date = dates[i];
        let dateHTML = `
            <div class='calender-day ${dates[i].numberOfEvents >= 1 ? 'event' : ''}'>
                <p>${date.monthday}</p>
            </div>
        `
        calenderHTML += dateHTML;
    }
    calenderDOM.innerHTML = calenderHTML;
}
drawCalender();

function toMonthName(monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber);

    return date.toLocaleString('en-US', {
        month: 'long',
    });
}