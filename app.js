var express = require('express');
var surveyController = require('./controllers/SurveyController');

var app = express();

// set up template engine (ejs)
app.set('view engine', 'ejs');

// static files
app.use(express.static('./public'));

// start controller
surveyController(app);

// listen to port
app.listen(3000);
console.log("Listening to port 3000");