const chartListContainerDOM = document.getElementById('chart-list-container');
const allChartsList = [];

const createChart = async (chartData) => {
    const chartCanvasDOM = document.createElement('canvas');
    chartCanvasDOM.id = `canvas-${allChartsList.length}`
    chartCanvasDOM.width = 1000
    const ctx = chartCanvasDOM.getContext('2d')
    //chart content is not accessable, labels are necessary
    chartCanvasDOM.ariaLabel = 'data visualization chart';
    chartCanvasDOM.ariaRoleDescription = 'image';

    //append canvas to dom
    chartListContainerDOM.appendChild(chartCanvasDOM)
    const datasets = chartData.datasets.map(set => {
        const {yLabels, label, color} = set;
        return {
            label: label,
            data: yLabels,
            backgroundColor: [
                color
            ],
            borderColor: [
                color
            ],
            borderWidth: 1
        }
    })

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.xLabels,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    mode: 'nearest',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    allChartsList.push(chart)
}

const getColor = (index) => {
    const colors = [
        '#2ecc71',//G
        '#e74c3c',//R
        '#3498db',//B
        '#e67e22',//O
        '#1abc9c',//I
        '#f1c40f',//Y
        '#9b59b6'];//V
    return colors[index % colors.length];
}

const getMonthDonations = async (month, year) => {
    //gets all the days in the selected month
    const daysOfMonth = [];
    const currDate = new Date(year, month - 1, 1);
    while (currDate.getMonth() == month - 1) {
        daysOfMonth.push({date: currDate.toISOString(), total: 0})
        currDate.setDate(currDate.getDate() + 1);
    }

    while (new Date(daysOfMonth[0].date).getDay() != 0) daysOfMonth.shift();

    const lastDay = new Date(daysOfMonth[daysOfMonth.length - 1].date).getDay();
    for (let i = 0; i < 6 - lastDay; i ++) {
        const lastDate = new Date(daysOfMonth[daysOfMonth.length - 1].date)
        lastDate.setDate(lastDate.getDate() + 1)
        daysOfMonth.push({date: lastDate.toISOString(), total: 0})
    }

    const endDate = new Date(new Date(daysOfMonth[daysOfMonth.length -1].date).getTime() + 61199000).toISOString();
    const donationData = await getDonations(daysOfMonth[0].date, endDate)
    
    for (let i = 0; i < donationData.length; i ++) {

        const {Donation_Date, Donation_Amount} = donationData[i];

        const donationDate = new Date(year, new Date(Donation_Date).getMonth(), new Date(Donation_Date).getDate()).toISOString();
        daysOfMonth.filter(day => day.date == donationDate)[0].total += parseFloat(Donation_Amount.toFixed(2));
    }
    return daysOfMonth;
}

const createGraphData = async (month, year) => {
    const monthData = await getMonthDonations(month, year)
    
    const values = [];
    const weeks = [];
    let currentWeek = [];
    let weekDays = [];
    for (let i = 0; i < monthData.length; i ++) {
        currentWeek.push(monthData[i].total);
        weekDays.push(monthData[i].date);
        if (currentWeek.length == 7 || weekDays.length == 7) {
            values.push(currentWeek)
            weeks.push(weekDays);
            currentWeek = [];
            weekDays = [];
        }
    }

    const weekTotals = values.map((totals, i) => {
        return {
            totals: totals,
            total: totals.reduce((accum, val) => accum + val),
            days: weeks[i]
            // weight: totals.length
        }
    })

    const totals = weekTotals.map(week => week.total)
    console.log(totals.reduce((accum, val) => accum + val) / totals.length)

    return {
        x: weekTotals.map((week, i) => {
            const firstDay = new Date(week.days[0]);
            const lastDay = new Date(week.days[week.days.length - 1]);
            return `${firstDay.getMonth() + 1}/${firstDay.getDate()} - ${lastDay.getMonth() + 1}/${lastDay.getDate()}`
        }),
        y: weekTotals.map(week => week.total),
        label: `${new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' })} ${year} Donations`
    }
}

//setup function
//code will run as soon as it loads
(async () => {
    loading();
    const month = 10;
    const year = 2022;

    const graph1 = await createGraphData(month, year)
    // const graph2 = await createGraphData(month, year - 1)
    // const graph3 = await createGraphData(month, year - 2)
    // const graph4 = await createGraphData(month, year - 3)
    // const graph5 = await createGraphData(month, year - 4)
    // const graph6 = await createGraphData(month, year - 5)
    // const graph7 = await createGraphData(month, year - 6)
    // const graphs = [graph1, graph2, graph3, graph4, graph5, graph6, graph7]
    const graphs = [graph1]

    const graphData = {
        xLabels: graph1.x,
        datasets: graphs.map((graph, i) => {
            return {
                yLabels: graph.y,
                label: graph.label,
                color: getColor(i)
            }
        })
    }

    createChart(graphData)
    doneLoading();
})();