const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const cors = require('cors');
const upload = require('express-fileupload');
const enableWs = require('express-ws')

//middleware
app.use(upload());
app.use(cookieParser());
app.use(cors());
require('dotenv').config();
enableWs(app)

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

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

const start = async () => {
    try {
        app.listen(port, console.log(`\n server is listening on port ${port}\n http://localhost:${port}`));

    } catch (error) { console.log(error) }
}
start();