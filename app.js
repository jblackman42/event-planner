const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const cors = require('cors');
const fileUpload = require('express-fileupload');
const enableWs = require('express-ws')
var session = require('express-session');

//middleware
require('dotenv').config();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.set('trust proxy', 1) // trust first proxy

const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));
app.use(cookieParser());
app.use(cors());
enableWs(app)


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use("/styles",express.static(__dirname + "/views/styles"));
app.use("/scripts",express.static(__dirname + "/views/scripts"));
app.use("/assets",express.static(__dirname + "/views/assets"));
app.use("/README.md",express.static(__dirname + "/README.md"));


const port = process.env.PORT || 3000;

//navigation routing
app.use('/', require('./routes/index'))
app.use('/api/helpdesk', require('./routes/helpdesk.js'))
app.use('/api/oauth', require('./routes/oauth.js'))
app.use('/api/widgets', require('./routes/widgets.js'))
app.use('/api/prayer-wall', require('./routes/prayer-wall.js'))
app.use('/websocket', require('./routes/websocket.js'))
app.use('/api/sms', require('./routes/sms'));

const start = async () => {
    try {
        app.listen(port, console.log(`\n server is listening on port ${port}\n http://localhost:${port}`));

    } catch (error) { console.log(error) }
}
start();