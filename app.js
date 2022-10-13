const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");

//middleware
app.use(express.json());
app.use(cookieParser());
require('dotenv').config();

app.use(express.json({ limit: '16MB' }));
app.use(express.urlencoded({ extended: true }));

//other imported functions
const connectDB = require('./db/connect.js');
const populate = require('./populate')

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use("/styles",express.static(__dirname + "/views/styles"));
app.use("/scripts",express.static(__dirname + "/views/scripts"));
app.use("/assets",express.static(__dirname + "/views/assets"));


const port = process.env.PORT || 3000;

//navigation routing
app.use('/', require('./routes/index'))
app.use('/api/oauth', require('./routes/oauth.js'))
// app.use('/api/widgets', require('./routes/widgets.js'))
app.use('/api/main-service-attendance', require('./routes/MainServiceAttendanceRoutes.js'))

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        // await populate();
        app.listen(port, console.log(`server is listening on port ${port}, http://localhost:3000`));
    } catch (error) { console.log(error) }
}
start();