var express = require('express'),
http = require('http');

var DEBUG = require('debug');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var colors = require ('colors');
var lodash  = require('lodash').noConflict();
var _ = require('underscore');
var async = require('async');
var uuid = require('node-uuid');

var bodyParser  = require('body-parser');
var cors = require('cors');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({
    uploadDir: './shakeit'
});



app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
}));
//CORS for all origins
app.use(cors());
app.options('*', cors());

var fumpers = {};
var images = {};
var THRESHOLD = 900;

function check(currentTimeStamp, currentId, response) {
    console.log('number of fumps in comparison ' + Object.keys(fumpers).length);
    for (var key in fumpers) {
        console.log("compairing: " + Math.abs(currentTimeStamp - fumpers[key].timeStamp));
        if (Math.abs(currentTimeStamp - fumpers[key].timeStamp) < THRESHOLD && currentId != fumpers[key].username) {
            var elementResponse = {image: images[key].image, operation: fumpers[key].operation, ammount: fumpers[key].ammount, timeStamp : fumpers[key].timeStamp, username : fumpers[key].username, socket:  fumpers[key].socket};
            response.push(elementResponse);
            console.log("added to reponse one match ".green + fumpers[key].username);
        }
    }
    console.log('finished checking fumpers');
}

app.set('port', process.env.PORT ||  7000);

io.sockets.on('connection', function (socket) {

    console.log('socket connected'.yellow);

    socket.on('message', function (data) { //any object
        data = JSON.parse(data);
        console.log('Message: ', data);
        data.socket = socket;
        fumpers[data.username] = data;
        var response = [];
        check(data.timeStamp, data.username, response);
       
        if (response.length > 0) {
            console.log('talk to the other');
            var copyUser = lodash.clone(response[0]);
            delete copyUser.socket;
            var copyOfMe = lodash.clone(fumpers[data.username]);
            delete copyOfMe.socket;
            copyOfMe.image = images[data.username].image;
            copyOfMe.ammount = copyUser.ammount;
            response[0].socket.emit('shaked', copyOfMe);
            console.log(copyUser);
            console.log(copyOfMe);
            socket.emit('shaked', copyUser);
        }
    });

    socket.on('disconnect', function () {
        console.log('user disconnected: '.red, socket.id);
    });
});

app.post('/api/readings', function(req, res){
	console.log('post readings');
	// console.log(req);
	res.end('ok');
		
});

app.get('/api/hello', function(req, res){
	console.log('get hello');
	res.end('ok');
});


app.post('/api/uploadPicture', multipartMiddleware, function(req, res){
  // create a form to begin parsing
    console.log('something received ');
    //console.log(req.files);
    //console.log(req.body);

    var username = req.get('username') || "";
    var fileUploadPath = req && req.files && req.files.fileUpload.path;
    console.log(fileUploadPath);
    console.log('for: ' + username);

    images[username] = images[username] || {username:username};
    images[username].image = "/"+fileUploadPath;

    console.log(images[username]);
    console.log(images);
    
    res.end("ok");
});


server.listen(app.get('port'), function () {
  console.log('Express server listening on port '.yellow + app.get('port'));
});




