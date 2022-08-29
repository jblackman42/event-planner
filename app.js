const express = require('express');
const app = express();


//middleware
app.use(express.json())
require('dotenv').config()
app.use(express.json({ limit: '16MB' }));
app.use(express.urlencoded({ extended: true }));

//other imported functions
// set the view engine to ejs
app.set('view engine', 'ejs');

app.use("/styles",express.static(__dirname + "/views/styles"));
app.use("/scripts",express.static(__dirname + "/views/scripts"));
app.use("/assets",express.static(__dirname + "/views/assets"));


const port = process.env.PORT || 5000;

//navigation routing
app.use('/', require('./routes/index'))

const start = async () => {
    try {
        app.listen(port, console.log(`server is listening on port ${port}`));
    } catch (error) { console.log(error) }
}
start();