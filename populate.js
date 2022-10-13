const attendance2022 = require('./attendance2022.json');
const attendance2021 = require('./attendance2021.json');

const AttendanceSchema = require('./models/MainServiceAttendance');

const times = ["8:30", "10:00", "11:30", "5:30", "9:00", "11:00", "O/C"]

const populate = async () => {
    await AttendanceSchema.deleteMany({})
    for (let i = 0; i < attendance2022.length; i ++) {
        const {date, attendance} = attendance2022[i]
        for (let j = 0; j  < attendance.length; j ++) {
            const attendanceObj = {
                Year: 2022,
                //subtract 1 because javascript likes 0 too much
                Month: date.split('/')[0] - 1,
                //if its a saturday service subtract 1 from day to go from sunday to saturday
                Day: parseInt(date.split('/')[1]),
                Time: j == 6 ? 'O/C' : times[j],
                Campus: j <= 3 ? 'Glendale Campus' : j < 6 ? 'Peoria Campus' : 'Off Campus',
                Attendance: attendance[j]
            }
            console.log(attendanceObj)
            await AttendanceSchema.create(attendanceObj)
        }
        console.log('new day')
    }
    
    for (let i = 0; i < attendance2021.length; i ++) {
        const {date, attendance} = attendance2021[i]
        for (let j = 0; j  < attendance.length; j ++) {
            const attendanceObj = {
                Year: 2021,
                //subtract 1 because javascript likes 0 too much
                Month: date.split('/')[0] - 1,
                //if its a saturday service subtract 1 from day to go from sunday to saturday
                Day: parseInt(date.split('/')[1]),
                Time: j == 6 ? 'O/C' : times[j],
                Campus: j <= 3 ? 'Glendale Campus' : j < 6 ? 'Peoria Campus' : 'Off Campus',
                Attendance: attendance[j]
            }
            console.log(attendanceObj)
            await AttendanceSchema.create(attendanceObj)
        }
        console.log('new day')
    }
    console.log('all info created')
}

module.exports = populate;