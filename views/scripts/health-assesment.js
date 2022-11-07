const chartListContainerDOM = document.getElementById('chart-list-container');
const allChartsList = [];

const createChart = async (xLabels, yValues, label) => {
    const chartCanvasDOM = document.createElement('canvas');
    chartCanvasDOM.id = `canvas-${allChartsList.length}`
    chartCanvasDOM.width = 1000
    const ctx = chartCanvasDOM.getContext('2d')
    //chart content is not accessable, labels are necessary
    chartCanvasDOM.ariaLabel = 'data visualization chart';
    chartCanvasDOM.ariaRoleDescription = 'image';

    //append canvas to dom
    chartListContainerDOM.appendChild(chartCanvasDOM)

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xLabels,
            datasets: [{
                label: label,
                data: yValues,
                backgroundColor: [
                    '#3498db'
                ],
                borderColor: [
                    '#2980b9'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        }
    });
    allChartsList.push(chart)
}

//setup function
//code will run as soon as it loads
(async () => {
    const month = 10;
    const year = 2022;


    const monthDays = [];
    const currDate = new Date(2022, month - 1, 1)
    const donationData = await getDonations(year, month);
    
    const donationBatchTotal =  donationData.map(batch => batch.Batch_Total).reduce((accum, val) => accum + val)
    console.log(donationBatchTotal)
    
    const weeksList = [];
    let currWeek = [];
    for (let i = 0; i < monthData.length; i ++) {
        // const {date, day, total} = monthData[i];
        const day = new Date(monthData[i]).getDay();
        const date = monthData[i]

        //if currday is sunday
        if (day == 6) {
            currWeek.push(dayTotals[i]);
            
            if (currWeek.length == 7) weeksList.push({date: date, totals: currWeek})
            currWeek = [];
        } else {
            currWeek.push(dayTotals[i]);
        }
    }
    console.log(weeksList)

    // createChart(allMonthDays, dayTotals, `${new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' })} ${year} Donations`)
})();