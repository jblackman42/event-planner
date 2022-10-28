const attendance2022 = require('./attendance2022.json');
const attendance2021 = require('./attendance2021.json');
const online2021 = require('./online2021.json');
const online2022 = require('./online2022.json');

const AttendanceSchema = require('./models/Attendance');

// const times = ["8:30", "10:00", "11:30", "5:30", "9:00", "11:00", "O/C"]

const fix = async () => {
    console.log('start fixing!!!')
    const badObjects = await AttendanceSchema.find({Time: "2022"})
    const badObjIds = badObjects.map(object => {
        const {_id: id} = object;
        return id.toString();
    })
    for (let i = 0; i < badObjIds.length; i ++) {
        await AttendanceSchema.findByIdAndUpdate(badObjIds[i], {Time: "2021"}, (err, docs) => {
            if (err) { 
                console.log(err)
            } else {
                console.log('update succesful')
            }
        }).clone();
    }
}

const populate = async () => {
    // await AttendanceSchema.deleteMany({})
    
    const currYear = 2022;
    const currAttendance = online2022;


    // const sundays = [];
    // const currDate = new Date(currYear, 0, 1)
    // while (currDate.getFullYear() == currYear) {
    //     if (currDate.getDay() == 0) sundays.push(`${currDate.getMonth() + 1}/${currDate.getDate()}`)

    //     currDate.setDate(currDate.getDate() + 1)
    // }

    let total = 0;
    for (let i = 0; i < currAttendance.length; i ++) {
        for (let j = 0; j < currAttendance[i].attendance.length; j ++) {
            for (let l = 0; l < currAttendance[i].attendance[j].headcounts.length; l ++) {
                total ++;
            }
        }
    }

    let counter = 0;
    for (let i = 0; i < currAttendance.length; i ++) {
        const {congregation, columns, campusRule, attendance} = currAttendance[i]

        for (let j = 0; j  < attendance.length; j ++) {
            console.log(attendance)
            const {day, headcounts} = attendance[j];

            for (let l = 0; l < headcounts.length; l ++) {
                const attendanceObj = {
                    Year: currYear,
                    //subtract 1 because javascript likes 0 too much
                    Month: parseInt(day.split('/')[0] - 1),
                    //if its a saturday service subtract 1 from day to go from sunday to saturday
                    Day: parseInt(day.split('/')[1]),
                    Time: columns[l],
                    Campus: campusRule[l],
                    Congregation: congregation,
                    Attendance: headcounts[l]
                }
                console.log(`${Math.floor((counter / total) * 100)}%`)
                await AttendanceSchema.create(attendanceObj)
            }
        }
    }
    console.log('finished uploading')
}

// const populate = async () => {
//     await AttendanceSchema.deleteMany({})
//     for (let i = 0; i < attendance2022.length; i ++) {
//         const {date, attendance} = attendance2022[i]
//         for (let j = 0; j  < attendance.length; j ++) {
//             const attendanceObj = {
//                 Year: 2022,
//                 //subtract 1 because javascript likes 0 too much
//                 Month: date.split('/')[0] - 1,
//                 //if its a saturday service subtract 1 from day to go from sunday to saturday
//                 Day: parseInt(date.split('/')[1]),
//                 Time: j == 6 ? 'O/C' : times[j],
//                 Campus: j <= 3 ? 'Glendale Campus' : j < 6 ? 'Peoria Campus' : 'Off Campus',
//                 Attendance: attendance[j]
//             }
//             console.log(attendanceObj)
//             await AttendanceSchema.create(attendanceObj)
//         }
//         console.log('new day')
//     }
    
//     for (let i = 0; i < attendance2021.length; i ++) {
//         const {date, attendance} = attendance2021[i]
//         for (let j = 0; j  < attendance.length; j ++) {
//             const attendanceObj = {
//                 Year: 2021,
//                 //subtract 1 because javascript likes 0 too much
//                 Month: date.split('/')[0] - 1,
//                 //if its a saturday service subtract 1 from day to go from sunday to saturday
//                 Day: parseInt(date.split('/')[1]),
//                 Time: j == 6 ? 'O/C' : times[j],
//                 Campus: j <= 3 ? 'Glendale Campus' : j < 6 ? 'Peoria Campus' : 'Off Campus',
//                 Attendance: attendance[j]
//             }
//             console.log(attendanceObj)
//             await AttendanceSchema.create(attendanceObj)
//         }
//         console.log('new day')
//     }
//     console.log('all info created')
// }

module.exports = {
    populate,
    fix
};