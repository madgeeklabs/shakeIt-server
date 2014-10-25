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
var fumpers = {};
var THRESHOLD = 500;

function check(currentTimeStamp, currentId, response) {
    console.log('number of fumps in comparison ' + Object.keys(fumpers).length);
    for (var key in fumpers) {
        console.log("compairing: " + Math.abs(currentTimeStamp - fumpers[key].timeStamp));
        if (Math.abs(currentTimeStamp - fumpers[key].timeStamp) < THRESHOLD && currentId != fumpers[key].username) {
            var elementResponse = {timeStamp : fumpers[key].timeStamp, username : fumpers[key].username };
            response.push(elementResponse);
            console.log("added to reponse one match ".green + JSON.stringify(fumpers[key]));
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
        console.log(response);
        if (response) {
            console.log('talk to the other');
            response.socket.emit('shaked', 'and nicely');
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


server.listen(app.get('port'), function () {
  console.log('Express server listening on port '.yellow + app.get('port'));
});
