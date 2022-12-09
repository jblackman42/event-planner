const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const prompt = require('prompt');
const cors = require('cors');

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
require('dotenv').config();

app.use(express.json({ limit: '16MB' }));
app.use(express.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
//other imported functions
const connectDB = require('./db/connect.js');
const {populate, fix} = require('./populate')

//prompt informatin
const properties = [
    {
        name: 'populate'
    }
];
  
prompt.start();

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use("/styles",express.static(__dirname + "/views/styles"));
app.use("/scripts",express.static(__dirname + "/views/scripts"));
app.use("/assets",express.static(__dirname + "/views/assets"));
app.use("/README.md",express.static(__dirname + "/README.md"));


const port = process.env.PORT || 3000;

//navigation routing
app.use('/', require('./routes/index'))
app.use('/api/oauth', require('./routes/oauth.js'))
app.use('/api/widgets', require('./routes/widgets.js'))
app.use('/api/attendance', require('./routes/AttendanceRoutes.js'))

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, console.log(`\n server is listening on port ${port}\n http://localhost:${port}`));
        
        // prompt.get(properties, function (err, result) {
        //     if (err) {
        //       return console.error(err);
        //     }
        //     if (result.populate == 'y') populate();
        // });

    } catch (error) { console.log(error) }
}
start();