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


app.set('port', process.env.PORT ||  7000);



io.sockets.on('connection', function (socket) {

    console.log('socket connected'.yellow);

    socket.on('message', function (data) { //any object
        data = JSON.parse(data);
        console.log('Message: ', data);
        console.log(data.apiKey + ":" + data.roomId);
    });

    socket.on('disconnect', function () {
        console.log('user disconnected: '.red, socket.id);
        // delete from participants and broadcast it.
    });

});


app.post('/api/readings', function(req, res){
	console.log('post readings');
	console.log(req);
	res.end('ok');
		
});

app.get('/api/hello', function(req, res){
	console.log('get hello');
	res.end('ok');
});


server.listen(app.get('port'), function () {
  console.log('Express server listening on port '.yellow + app.get('port'));
});
