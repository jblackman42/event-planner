const eventCreateLimit = 52;
const recurringEventContainer = document.querySelector('.recurring-event-container');

const dailyTab = document.getElementById('daily');
const weeklyTab = document.getElementById('weekly');
const monthlyTab = document.getElementById('monthly');
const yearlyTab = document.getElementById('yearly');

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
    recurrencePattern = undefined;
    recurringLabel.innerText = 'One Time Event';
    patternHide();
}

const updatePatternOption = () => {
    const options = ['daily', 'weekly', 'monthly', 'yearly'];
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
    yearlyTab.classList.remove('active');
    updatePatternOption();
}

const showWeekly = () => {
    dailyTab.classList.remove('active')
    weeklyTab.classList.add('active');
    monthlyTab.classList.remove('active');
    yearlyTab.classList.remove('active');
    updatePatternOption();
}

const showMonthly = () => {
    dailyTab.classList.remove('active')
    weeklyTab.classList.remove('active');
    monthlyTab.classList.add('active');
    yearlyTab.classList.remove('active');
    updatePatternOption();
}

const showYearly = () => {
    dailyTab.classList.remove('active')
    weeklyTab.classList.remove('active');
    monthlyTab.classList.remove('active');
    yearlyTab.classList.add('active');
    updatePatternOption();
}

let days = [];

const getDailyPattern = (endOccurrences, endDate, startDate) => {
    //DAILY CODE

    const daysOption = document.getElementById('days');
    const weekdaysOption = document.getElementById('weekday');

    days = [];
    let currDate = startDate;

    if (daysOption.checked) {
        const daysNumberOption = document.getElementById('days-number-option');
        
        while ((days.length < endOccurrences - 1 || new Date(currDate) <= new Date(endDate)) && days.length < eventCreateLimit) {
            let tomorrow = new Date(currDate);
            tomorrow.setDate(tomorrow.getDate() + parseInt(daysNumberOption.value));
            currDate = tomorrow;
            days.push(tomorrow.toISOString());
        }
        console.log(days)
    } else if (weekdaysOption.checked) {
        while ((days.length < endOccurrences - 1 || new Date(currDate) <= new Date(endDate)) && days.length < eventCreateLimit) {
            let tomorrow = new Date(currDate);
            tomorrow.setDate(tomorrow.getDate() + 1);
            currDate = tomorrow;
            if (currDate.getDay() != 0 && currDate.getDay() != 6) {
                days.push(tomorrow.toISOString());
            }
        }
        console.log(days)
    } else {
        return false;
    }
    return true;
}
const getWeeklyPattern = (endOccurrences, endDate, startDate) => {
    //WEEKLY CODE
    const weekPattern = document.getElementById('week-pattern'); //weekly recurrence number
    const checkboxSunday = document.getElementById('week-pattern-sunday');
    const checkboxMonday = document.getElementById('week-pattern-monday');
    const checkboxTuesday = document.getElementById('week-pattern-tuesday');
    const checkboxWednesday = document.getElementById('week-pattern-wednesday');
    const checkboxThursday = document.getElementById('week-pattern-thursday');
    const checkboxFriday = document.getElementById('week-pattern-friday');
    const checkboxSaturday = document.getElementById('week-pattern-saturday');
    const weekdayOptions = [checkboxSunday, checkboxMonday, checkboxTuesday, checkboxWednesday, checkboxThursday, checkboxFriday, checkboxSaturday];
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const selectedDays = weekdayOptions.filter((elem, index) => elem.checked).map(elem => weekdays.indexOf(elem.value));

    console.log(selectedDays)

    // simplifiedInstructions = `Every ${weekPattern.value} week(s) on ${selectedDays.map(elem => elem.value).join(', ')}`;
    if (!selectedDays.length) {
        return false;
    }

    days = [];
    let allDays = [];
    let currDate = startDate;
    let currentWeek = []

    while ((days.length < endOccurrences - 1 || new Date(currDate) <= new Date(endDate)) && days.length < eventCreateLimit) {
        let tomorrow = new Date(currDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        currentWeek.push(tomorrow);
        currDate = tomorrow;
        if (currDate.getDay() == 0) {
            allDays.push(currentWeek);
            currentWeek = [];
        }
    }
    console.log(currentWeek)
    if (currentWeek.length) {
        allDays.push(currentWeek);
        currentWeek = [];
    }
    
    for (let i = weekPattern.value - 1; i < allDays.length; i += weekPattern.value) {
        allDays.splice(i, 1);
        i --;
    }
    
    for (week of allDays) {
        for (day of week) {
            if (selectedDays.includes(day.getDay())) {
                days.push(day.toISOString())
            }
            console.log(day)
        }
    }

    return true;
}
const getMonthlyPattern = () => {
    //MONTHLY CODE
    patternType = 2;
    const dayOfMonthOption = document.getElementById('day-of-month');
    const timesOfMonthOption = document.getElementById('times-of-month');

    if (dayOfMonthOption.checked) {
        const monthDayValue = document.getElementById('month-day')
        const everyMonthValue = document.getElementById('every-month-num')

        // console.log(`Day ${monthDayValue.value} of every ${everyMonthValue.value} month(s)`)
        simplifiedInstructions = `Day ${monthDayValue.value} of every ${everyMonthValue.value} month(s)`;
    } else if (timesOfMonthOption.checked) {
        const monthDayPattern = document.getElementById('monthly-day-pattern');
        const weekdayPattern = document.getElementById('weekday-pattern');
        const everyMonthValue = document.getElementById('every-month-num-2')

        // console.log(`The ${monthDayPattern.value} ${weekdayPattern.value} of every ${everyMonthValue.value} month(s)`)
        simplifiedInstructions = `The ${monthDayPattern.value} ${weekdayPattern.value} of every ${everyMonthValue.value} month(s)`;
    } else {
        // console.log('missing parameters')
        // errors.push('missing parameters')
    }
}
const getYearlyPattern = () => {
    //YEARLY CODE
    patternType = 3;
    const singleMonthDay = document.getElementById('single-month-day');
    const singleMonthTime = document.getElementById('single-month-time');

    if (singleMonthDay.checked) {
        const monthYearPattern = document.getElementById('month-year-pattern');
        const monthPatternNumber = document.getElementById('month-pattern-number');

        // console.log(`Every ${monthYearPattern.value} ${monthPatternNumber.value}`);
        simplifiedInstructions = `Every ${monthYearPattern.value} ${monthPatternNumber.value}`;
    } else if (singleMonthTime.checked) {
        const yearlyDayPattern = document.getElementById('yearly-day-pattern');
        const yearlyWeekPattern = document.getElementById('yearly-week-pattern');
        const yearlyMonthPattern = document.getElementById('yearly-month-pattern');

        // console.log(`The ${yearlyDayPattern.value} ${yearlyWeekPattern.value} of ${yearlyMonthPattern.value}`)
        simplifiedInstructions = `The ${yearlyDayPattern.value} ${yearlyWeekPattern.value} of every ${yearlyMonthPattern.value}`
    } else {
        // console.log('missing parameters')
        // errors.push('missing parameters')
    }
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

    let patternTypes = ['daily', 'weekly', 'monthly', 'yearly'];
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
             if (getDailyPattern(occurrenceNumber.value, byDateInputDate.value, startDateDOM.value)) {
                hideWarning();
             } else {
                showWarning();
                return;
             }
            break;
        case 1:
            if (getWeeklyPattern(occurrenceNumber.value, byDateInputDate.value, startDateDOM.value)) {
                hideWarning();
            } else {
                showWarning();
                return;
            }
            break;
        case 2:
            getMonthlyPattern();
            break;
        case 3:
            getYearlyPattern();
            break;
        default:
            break;
    }

    // if (activeOption == 'daily') {
    // } else if (activeOption == 'weekly') {
    // } else if (activeOption == 'monthly') {
    // } else if (activeOption == 'yearly') {
    // }


    // let endInstructions = '';


    // //if there are no errors
    // if (!errors.length) {
    //     warningMsg.style.visibility = 'hidden';
    //     warningMsg.style.display = 'none';


    //     // recurrencePattern = `
    //     //     start: ${new Date(startDateDOM.value).toDateString()} @ ${new Date(startDateDOM.value).toLocaleTimeString()}
    //     //     end: ${endInstructions}
    //     //     recur: ${simplifiedInstructions}
    //     // `
    //     // // console.log(recurrencePattern)
    //     // recurringLabel.innerText = simplifiedInstructions;
    //     // patternHide();
    // } else {
    // }
}