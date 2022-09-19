const recurringEventContainer = document.querySelector('.recurring-event-container');

const dailyTab = document.getElementById('daily');
const weeklyTab = document.getElementById('weekly');
const monthlyTab = document.getElementById('monthly');
const yearlyTab = document.getElementById('yearly');

const startByDate = document.getElementById('start-by');

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

const handleSave = () => {
    const activeOption = document.querySelector('.active').id;
    const recurringLabel = document.getElementById('recurring-label');
    let simplifiedInstructions = '';
    if (activeOption == 'daily') {
        //DAILY CODE
        const daysOption = document.getElementById('days');
        const weekdaysOption = document.getElementById('weekday');

        if (daysOption.checked) {
            const daysNumberOption = document.getElementById('days-number-option');
            // console.log(`every ${daysNumberOption.value} day(s)`);
            simplifiedInstructions = `every ${daysNumberOption.value} day(s)`;
        } else if (weekdaysOption.checked) {
            // console.log('every weekday')
            simplifiedInstructions = 'every weekday';
        } else {
            console.log('missing parameters')
        }
    } else if (activeOption == 'weekly') {
        //WEEKLY CODE
        const weekPattern = document.getElementById('week-pattern');
        const checkboxSunday = document.getElementById('week-pattern-sunday');
        const checkboxMonday = document.getElementById('week-pattern-monday');
        const checkboxTuesday = document.getElementById('week-pattern-tuesday');
        const checkboxWednesday = document.getElementById('week-pattern-wednesday');
        const checkboxThursday = document.getElementById('week-pattern-thursday');
        const checkboxFriday = document.getElementById('week-pattern-friday');
        const checkboxSaturday = document.getElementById('week-pattern-saturday');
        const weekdayOptions = [checkboxSunday, checkboxMonday, checkboxTuesday, checkboxWednesday, checkboxThursday, checkboxFriday, checkboxSaturday];
        const selectedDays = weekdayOptions.filter((elem, index) => elem.checked);

        // console.log(`Every ${weekPattern.value} week(s) on ${selectedDays.map(elem => elem.value).join(', ')}`);
        simplifiedInstructions = `Every ${weekPattern.value} week(s) on ${selectedDays.map(elem => elem.value).join(', ')}`;
    } else if (activeOption == 'monthly') {
        //MONTHLY CODE
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
            console.log('missing parameters')
        }
    } else if (activeOption == 'yearly') {
        //YEARLY CODE
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
            console.log('missing parameters')
        }
    }

    const occurrenceInput = document.getElementById('occurrence');
    const byDateInput = document.getElementById('by-date');

    let endInstructions = '';

    if (occurrenceInput.checked) {
        const occurrenceNumber = document.getElementById('occurrence-num');
        // console.log(`end after ${occurrenceNumber.value} occurrences`) 
        endInstructions = `after ${occurrenceNumber.value} occurrences`;
    } else if (byDateInput.checked) {
        const byDateInput = document.getElementById('by-date-input');
        // console.log(`end by date ${byDateInput.value}`)
        endInstructions = `by date ${byDateInput.value}`;
    } else {
        console.log('missing parameters')
    }

    recurrencePattern = `
        start: ${new Date(startDateDOM.value).toDateString()} @ ${new Date(startDateDOM.value).toLocaleTimeString()}
        end: ${endInstructions}
        recur: ${simplifiedInstructions}
    `
    console.log(recurrencePattern)
    recurringLabel.innerText = simplifiedInstructions;
    patternHide();
}