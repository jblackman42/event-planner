const eventCreateLimit = 52;
const recurringEventContainer = document.querySelector('.recurring-event-container');

const dailyTab = document.getElementById('daily');
const weeklyTab = document.getElementById('weekly');
const monthlyTab = document.getElementById('monthly');
// const yearlyTab = document.getElementById('yearly');

const startByDate = document.getElementById('start-by');

const warningMsg = document.getElementById('recurring-warning-msg');

let recurrencePattern = undefined;

const patternShow = () => {
    recurringEventContainer.style.visibility = 'visible';
    recurringEventContainer.style.display = 'grid';

    if (startDateDOM.value) {
        startByDate.innerText = new Date(startDateDOM.value).toDateString() + ' @ ' + new Date(startDateDOM.value).toLocaleTimeString();
    }
}

const patternHide = () => {
    recurringEventContainer.style.visibility = 'hidden';
    recurringEventContainer.style.display = 'none';
}

const cancel = () => {
    const recurringLabel = document.getElementById('recurring-label');
    recurringLabel.innerText = 'One Time Event';
    patternHide();
}

const updatePatternOption = () => {
    const options = ['daily', 'weekly', 'monthly'];
    const activeOption = document.querySelector('.active').id;

    const hiddenOptions = options.filter(option => option != activeOption);
    hiddenOptions.forEach(optionName => {
        const elem = document.getElementById(`${optionName}-options`);
        elem.style.visibility = 'hidden';
        elem.style.display = 'none';
    })
    const activeElem = document.getElementById(`${activeOption}-options`)
    activeElem.style.visibility = 'visible';
    activeElem.style.display = 'block';
}
updatePatternOption();

const showDaily = () => {
    dailyTab.classList.add('active')
    weeklyTab.classList.remove('active');
    monthlyTab.classList.remove('active');
    updatePatternOption();
}

const showWeekly = () => {
    dailyTab.classList.remove('active')
    weeklyTab.classList.add('active');
    monthlyTab.classList.remove('active');
    updatePatternOption();
}

const showMonthly = () => {
    dailyTab.classList.remove('active')
    weeklyTab.classList.remove('active');
    monthlyTab.classList.add('active');
    updatePatternOption();
}

const showYearly = () => {
    dailyTab.classList.remove('active')
    weeklyTab.classList.remove('active');
    monthlyTab.classList.remove('active');
    updatePatternOption();
}

let days = [];

const getDailyPattern = (endOccurrences, endDate, startDate) => {
    //DAILY CODE

    const daysOption = document.getElementById('days');
    const weekdaysOption = document.getElementById('weekday');

    days = [new Date(startDate).toISOString()];
    let currDate = startDate;

    if (daysOption.checked) {
        const daysNumberOption = document.getElementById('days-number-option');
        
        while ((days.length < endOccurrences || new Date(currDate) <= new Date(endDate)) && days.length < eventCreateLimit) {
            let tomorrow = new Date(currDate);
            tomorrow.setDate(tomorrow.getDate() + parseInt(daysNumberOption.value));
            currDate = tomorrow;
            days.push(tomorrow.toISOString());
        }
        // console.log(days)
    } else if (weekdaysOption.checked) {
        while ((days.length < endOccurrences || new Date(currDate) <= new Date(endDate)) && days.length < eventCreateLimit) {
            let tomorrow = new Date(currDate);
            tomorrow.setDate(tomorrow.getDate() + 1);
            currDate = tomorrow;
            if (currDate.getDay() != 0 && currDate.getDay() != 6) {
                days.push(tomorrow.toISOString());
            }
        }
        // console.log(days)
    } else {
        return false;
    }
    return true;
}
const getWeeklyPattern = (endOccurrences, endDate, startDate) => {
    //WEEKLY CODE
    const weekPattern = document.getElementById('week-pattern'); //weekly recurrence number
    const occurrenceInput = document.getElementById('occurrence');
    const checkboxSunday = document.getElementById('week-pattern-sunday');
    const checkboxMonday = document.getElementById('week-pattern-monday');
    const checkboxTuesday = document.getElementById('week-pattern-tuesday');
    const checkboxWednesday = document.getElementById('week-pattern-wednesday');
    const checkboxThursday = document.getElementById('week-pattern-thursday');
    const checkboxFriday = document.getElementById('week-pattern-friday');
    const checkboxSaturday = document.getElementById('week-pattern-saturday');
    const weekdayOptions = [checkboxSunday, checkboxMonday, checkboxTuesday, checkboxWednesday, checkboxThursday, checkboxFriday, checkboxSaturday];
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const selectedDays = weekdayOptions.filter(elem => elem.checked).map(elem => weekdays.indexOf(elem.value));

    // simplifiedInstructions = `Every ${weekPattern.value} week(s) on ${selectedDays.map(elem => elem.value).join(', ')}`;
    if (!selectedDays.length) {
        return false;
    }

    days = [new Date(startDate).toISOString()];
    let allDays = [];
    let currDate = new Date(startDate);
    let currentWeek = []
    while ((currDate <= new Date(endDate) || days.length <= endOccurrences * selectedDays.length) && days.length < eventCreateLimit) {
        let tomorrow = new Date(currDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        currDate = tomorrow;
        // console.log(new Date(endDate) < currDate, currDate)
        
        if (currDate.getDay() == 0 && currentWeek.length) {
            allDays.push(currentWeek);
            
            if ((allDays.length - 1) % weekPattern.value == 0) {
                days = days.concat(currentWeek)
            }
            currentWeek = [];
        }

        if (selectedDays.includes(currDate.getDay())) {
            currentWeek.push(currDate.toISOString())
        }

        if (new Date(endDate) < currDate) {
            allDays.push(currentWeek)
            
            if ((allDays.length - 1) % weekPattern.value == 0) {
                days = days.concat(currentWeek)
            }
        }


    }
    
    if (occurrenceInput.checked && days.length > endOccurrences * selectedDays.length) {
        days.length = endOccurrences * selectedDays.length;
    }

    return true;
}

const getWeekdayOfMonth = (dateString, dayOfWeek, weekValue) => {
    // console.log(dateString, dayOfWeek, weekValue)
    var date = new Date(dateString);

    var day = date.getDay();
    var diffDays = 0;

    //if user chooses 'last' option
    if (weekValue == 0) {
        return getLastWeekdayOfMonth(date.getFullYear(), date.getMonth(), dayOfWeek)
    }

    //if user chooses 'day' option
    if (dayOfWeek == -1) {
        return new Date(date.getFullYear(), date.getMonth(), weekValue)
    }

    if (day > dayOfWeek) {
      diffDays = 7 - (day - dayOfWeek);
    } else {
      diffDays = dayOfWeek - day
    }

    return new Date(date.setDate(date.getDate() + (diffDays + (7 * (weekValue - 1)))));
}
const getLastWeekdayOfMonth = (year, month, weekday) => {
    var date = new Date(year, month, 1);

    var days = [];

    //if user chooses 'last' and 'day' options
    if (weekday == -1) {
        //returns the last day of the month
        return new Date(date.getFullYear(), date.getMonth() + 1, 0)
    }

    while (date.getMonth() === month) {
        if (date.getDay() === weekday) days.push(new Date(date))
        date.setDate(date.getDate() + 1);
    }

    return days[days.length -1]; 
}
const getMonthlyPattern = (endOccurrences, endDate, startDate) => {
    endDate = endDate.split('-').join('/')
    //MONTHLY CODE
    const dayOfMonthOption = document.getElementById('day-of-month');
    const timesOfMonthOption = document.getElementById('times-of-month');

    if (dayOfMonthOption.checked) {
        const monthDayValue = document.getElementById('month-day')
        const everyMonthValue = document.getElementById('every-month-num')

        days = [new Date(startDate).toISOString()];
        let currDate = new Date(new Date(startDate).setDate(monthDayValue.value))
        while ((currDate <= new Date(endDate) || days.length < endOccurrences) && days.length < eventCreateLimit) {
            // console.log(everyMonthValue.value)
            currDate = new Date(new Date(currDate).setMonth(currDate.getMonth() + parseInt(everyMonthValue.value)))
            
            if (new Date(currDate.toLocaleDateString()) <= new Date(endDate) ||  days.length < endOccurrences) {
                days.push(currDate.toISOString());
            } else {
                break;
            }
        }
        // console.log(days)

    } else if (timesOfMonthOption.checked) {
        const monthDayPattern = document.getElementById('monthly-day-pattern');
        const weekdayPattern = document.getElementById('weekday-pattern');
        const everyMonthValue = document.getElementById('every-month-num-2')

        let fullStartDate = new Date(startDate)

        days = [new Date(startDate).toISOString()];
        //gets the first day of the next month after the start date
        let currDate = new Date(fullStartDate.getFullYear(), fullStartDate.getMonth() + parseInt(everyMonthValue.value), 1)
        while ((currDate <= new Date(endDate) || days.length < endOccurrences) && days.length < eventCreateLimit) {
            let newDate = getWeekdayOfMonth(currDate.toLocaleDateString(), parseInt(weekdayPattern.value), parseInt(monthDayPattern.value))
            // console.log(newDate)
            days.push(newDate.toISOString().split('T')[0] + 'T' + fullStartDate.toISOString().split('T')[1]);
            // days.push(currDate)
            currDate = new Date(currDate.getFullYear(), currDate.getMonth() + parseInt(everyMonthValue.value), 1)
        }
        // console.log(days)
        
    } else {
        return false;
    }
    return true;
}

const showWarning = () => {
    warningMsg.style.visibility = 'visible';
    warningMsg.style.display = 'block';
}
const hideWarning = () => {
    warningMsg.style.visibility = 'hidden';
    warningMsg.style.display = 'none';
}

const handleSave = () => {
    const activeOption = document.querySelector('.active').id;

    let patternTypes = ['daily', 'weekly', 'monthly'];
    let patternType = patternTypes.indexOf(activeOption);

    //radio buttons
    const occurrenceInput = document.getElementById('occurrence');
    const byDateInput = document.getElementById('by-date');


    //date / number inputs
    const byDateInputDate = document.getElementById('by-date-input');
    const occurrenceNumber = document.getElementById('occurrence-num');
    if (occurrenceInput.checked) {
        // console.log(`end after ${occurrenceNumber.value} occurrences`)
    } else if (byDateInput.checked && byDateInputDate.value) {
        // console.log(`end by date ${byDateInput.value}`)
    } else {
        showWarning();
        return;
    }


    switch (patternType) {
        case 0:
             if (getDailyPattern(occurrenceInput.checked ? occurrenceNumber.value : 0, byDateInput.checked ? byDateInputDate.value : '', startDateDOM.value)) {
                hideWarning();
                patternHide();
                updateEventTimes();
             } else {
                showWarning();
                return;
             }
            break;
        case 1:
            if (getWeeklyPattern(occurrenceInput.checked ? occurrenceNumber.value : 0, byDateInput.checked ? byDateInputDate.value : '', startDateDOM.value)) {
                hideWarning();
                patternHide();
                updateEventTimes();
            } else {
                showWarning();
                return;
            }
            break;
        case 2:
            if (getMonthlyPattern(occurrenceInput.checked ? occurrenceNumber.value : 0, byDateInput.checked ? byDateInputDate.value : '', startDateDOM.value)) {
                hideWarning();
                patternHide();
                updateEventTimes();
            } else {
                showWarning();
                return;
            }
            break;
        default:
            break;
    }

    //convert all days to the correct time zone
    days = days.map(day => {
        const date = new Date(day);
        return new Date( date.getTime() - ( date.getTimezoneOffset() * 60000 ) ).toISOString();
    })

    const recurringLabel = document.getElementById('recurring-label');
    recurringLabel.innerText = `${days.length} Events`;

    reviewShow();
}

const elem = document.getElementById('days-number-option');
const dailyOption1 = () => {
    elem.disabled = false ;
}
const dailyOption2 = () => {
    elem.disabled = true;
}
//option 1
const month1Opt1 = document.getElementById('month-day');
const month1Opt2 = document.getElementById('every-month-num');
//option2
const month2Opt1 = document.getElementById('monthly-day-pattern');
const month2Opt2 = document.getElementById('weekday-pattern');
const month2Opt3 = document.getElementById('every-month-num-2');
const monthlyOption1 = () => {
    month1Opt1.disabled = false;
    month1Opt2.disabled = false;

    month2Opt1.disabled = true;
    month2Opt2.disabled = true;
    month2Opt3.disabled = true;
}
const monthlyOption2 = () => {
    month1Opt1.disabled = true;
    month1Opt2.disabled = true;

    month2Opt1.disabled = false;
    month2Opt2.disabled = false;
    month2Opt3.disabled = false;
}
//option 1
const endOpt1 =  document.getElementById('occurrence-num');
//option 2
const endOpt2 = document.getElementById('by-date-input');
const endOption1 = () => {
    endOpt1.disabled = false;
    endOpt2.disabled = true;
}
const endOption2 = () => {
    endOpt1.disabled = true;
    endOpt2.disabled = false;
}