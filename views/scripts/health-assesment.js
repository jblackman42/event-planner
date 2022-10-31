const tableContainer = document.getElementById('table-container');

const drawTable = async (attendanceData, year, campus, congregation, graphScale) => {
    const tableContainerElem = document.createElement('div');
    tableContainerElem.id = 'attendance-table'
        
    // const years = [...new Set(attendanceData.map(attendance => attendance.Year))]
    const currYearAttendance = campus && congregation
    ? attendanceData.filter(attendance => attendance.Year == year && attendance.Campus == campus && attendance.Congregation == congregation)
    : campus
    ? attendanceData.filter(attendance => attendance.Year == year && attendance.Campus == campus)
    : congregation
    ? attendanceData.filter(attendance => attendance.Year == year && attendance.Congregation == congregation)
    : attendanceData.filter(attendance => attendance.Year == year);

    const sundays = [...new Set(currYearAttendance.map(attendance => `${attendance.Month + 1}/${attendance.Day}`))];
    const totals = [];

    const yearTableElem = document.createElement('table');
    const yearTableHeadElem = document.createElement('thead');

    const yearTableRowElem = document.createElement('tr');

    const serviceTimes = [...new Set(currYearAttendance.map(attendance => attendance.Time))]

    const tableHeaders = serviceTimes;
    tableHeaders.unshift('Date');
    tableHeaders.unshift('Week');
    tableHeaders.push('Total')
    // const tableHeaders = ['Week', 'Date', '8:30', '10:00', '11:30', '5:30', '9:00', '11:00', 'O/C', 'Total'];

    tableHeaders.forEach(header => {
        const yearTableHeader = document.createElement('th');
        const headerText = document.createTextNode(header)
        yearTableHeader.appendChild(headerText)
        yearTableRowElem.appendChild(yearTableHeader)
    })
    
    const tableTitleElem = document.createElement('h1');
    tableTitleElem.id = 'table-title'
    const tableTitle = document.createTextNode(`${year} ${campus ? campus : "Totals"} ${congregation ? `: ${congregation}` : ''}`);
    tableTitleElem.appendChild(tableTitle)

    yearTableHeadElem.appendChild(yearTableRowElem)
    yearTableElem.appendChild(yearTableHeadElem);
    tableContainerElem.appendChild(tableTitleElem)
    tableContainerElem.appendChild(yearTableElem)
    
    let prevWeek;
    let prevTotal;
    for (let j = 0; j < sundays.length; j ++) {
        const currWeek = currYearAttendance.filter(attendance => `${attendance.Month + 1}/${attendance.Day}` == sundays[j])

        const yearTableRowWeekElem = document.createElement('tr');

        const currWeekNumElem = document.createElement('td'); //create table data elem
        const currWeekNum = document.createTextNode(`${j + 1}.`); //create text that goes in table data elem
        currWeekNumElem.appendChild(currWeekNum); //put text in table data elem
        yearTableRowWeekElem.appendChild(currWeekNumElem); //put table data elem in table row

        const currWeekDateElem = document.createElement('td'); //create table data elem
        const currWeekDate = document.createTextNode(`${sundays[j]}`); //create text that goes in table data elem
        currWeekDateElem.appendChild(currWeekDate); //put text in table data elem
        yearTableRowWeekElem.appendChild(currWeekDateElem); //put table data elem in table row

        currWeek.forEach((week, i) => {
            const currDayAttendanceElem = document.createElement('td'); //create table data elem
            currDayAttendanceElem.id = prevWeek ? prevWeek[i].Attendance : 'neutral';
            const currDayAttendance = document.createTextNode(`${week.Attendance}`);
            // const currDayAttendance = document.createTextNode(`${week.Attendance} ${prevWeek ? prevWeek[i].Attendance > week.Attendance ? '-' : prevWeek[i].Attendance < week.Attendance ? '+' : '' : ''}`);
            currDayAttendanceElem.appendChild(currDayAttendance);
            yearTableRowWeekElem.appendChild(currDayAttendanceElem)
        })

        const currWeekTotalElem = document.createElement('td'); //create table data elem
        currWeekTotalElem.id = 'total'
        const total = currWeek.reduce((accum, value) => accum + value.Attendance, 0);
        totals.push(total)
        const currWeekTotal = document.createTextNode(`${total}`); //create text that goes in table data elem
        // const currWeekTotal = document.createTextNode(`${total} ${prevTotal ? prevTotal > total ? '-' : prevTotal < total ? '+' : '' : ''}`); //create text that goes in table data elem
        currWeekTotalElem.appendChild(currWeekTotal); //put text in table data elem
        yearTableRowWeekElem.appendChild(currWeekTotalElem); //put table data elem in table row

        yearTableElem.appendChild(yearTableRowWeekElem)

        prevWeek = currWeek;
    }

    // tableContainer.appendChild(tableContainerElem)

    // const filteredSundays1 = sundays.filter(month => month.split('/')[0] <= 6);
    // const filteredTotals1 = totals.filter((val, i) => i < filteredSundays1.length);

    // const filteredSundays2 = sundays.filter(month => month.split('/')[0] > 6);
    // const filteredTotals2 = totals.filter((val, i) => i >= filteredTotals1.length)

    //****************************************************** */

    // drawGraph(filteredSundays1, filteredTotals1, graphScale, congregation, year, campus);
    // drawGraph(filteredSundays2, filteredTotals2, graphScale, congregation, year, campus);

    drawLineGraph(sundays, totals, graphScale, congregation, year, campus);

    //***************************************************** */
}

const graphDonations = async () => {
    console.log('this is a test')
}

const setup = async () => {
    loading();


    const year = 2022;
    const month = 10;
    const campus = "";

    const attendanceData = await axios({
        method: 'get',
        url: `http://localhost:3000/api/attendance`,
    })
        .then(response => response.data)

    const monthDays = [];
    const currDate = new Date(2022, month - 1, 1)
    const donationData = await getDonations(year, month);
    
    while (currDate.getMonth() === month - 1) {
        monthDays.push(currDate.getDate());
        currDate.setDate(currDate.getDate() + 1);
    }
    
    const donationDayTotals = [];
    for (let i = 0; i < monthDays.length; i ++) {
        const daysDonations = donationData.filter(donation => {
            const {Donation_Date} = donation;
            const date = new Date(Donation_Date);
            return date.getDate() == monthDays[i];
        })
        donationDayTotals.push(daysDonations.length ? Math.round(daysDonations.map(donation => donation.Donation_Amount).reduce((prev, curr) => prev + curr) * 100) / 100 : 0)
    }
    
    drawLineGraph(monthDays, donationDayTotals, 2000, "Tithes & Offerings", year, new Date(year,month - 1,1).toLocaleString('default', { month: 'long' }));
    drawTable(attendanceData, year, campus, "2 Year Olds")
    drawTable(attendanceData, year, campus, "3 Year Olds")
    drawTable(attendanceData, year, campus, "4 Year Olds")
    drawTable(attendanceData, year, campus, "Kindergarten")
    drawTable(attendanceData, year, campus, "Elementary")
    drawTable(attendanceData, year, campus, "JR High")
    drawTable(attendanceData, year, campus, "High School")
    drawTable(attendanceData, year, campus, "Adult Ministry")
    drawTable(attendanceData, year, "", "Online")

    // drawTable(attendanceData, year, campus, "Adult Ministry")

    doneLoading();
}
setup();