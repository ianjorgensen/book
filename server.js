var server = require('router').create();
var buffoon = require('buffoon');
var _ = require('underscore');
var aejs = require('async-ejs');
var common = require('common');
var file = require('./lib/file').file;
var db = require('mongojs').connect('mongodb://root:root@staff.mongohq.com:10084/vedbaek-booking',['booking']);

var port = process.argv[2] || 8080;
var users = {
	ian : {
		name: 'ian',
		fullname: 'Ian Jorgensen',
		email: 'i@ge.tt',
		phone: '004527187566'
	},
	mads: {
		name: 'mads',
		fullname: 'Mads Ring',
		email: 'mads@ri.ng',
		phone: '00453232323'
	}
};

var respond = function(response, data, status) {
	response.writeHead(status || 200, {'content-type':'application/json'});
	response.end(JSON.stringify(data));			
};

server.get('/user/{user}', file('./html/book.html'));

server.get('/bookings', function(request, response) {
	db.booking.find(function(err, data) {
		if(err) {
			respond(response,{err:err.message},500);
			return;
		}
		respond(response, data);
	});
});
server.get('/user/{user}/book', function(request, response) {
	if (!request.query.date) {
		respond(response, {err:'no date'}, 500);
	}
	db.booking.findOne({bookingId: request.query.date}, common.fork(function(err) {
		respond(response, {err:'no date'}, 500);
	}, function(booking) {
		if (booking) {
			respond(response, {taken:1}, 200);
			return;
		}
		db.booking.save({bookingId: request.query.date,user: users[request.params.user]}, common.fork(function(err) {
			respond(response, {err:'no date'}, 500);
		}, function(data) {
			respond(response, {}, 200);
		}));
	}));
});
server.get('/user/{user}/unbook', function(request, response) {
	if (!request.query.date) {
		respond(response, {err:'no date'}, 500);
	}

	db.booking.remove({bookingId: request.query.date}, common.fork(function(err) {
		respond(response, {err:'no date'}, 500);
	}, function(data) {
		respond(response, {}, 200);
	}));
});
server.get('/remove', function(request, response) {
	db.booking.remove(function(err) {
		respond(response, {}, err ? 500: 200);
	});
});
server.get('/js/*', file('./js/{*}'));
server.get('/css/*', file('./css/{*}'));
server.all('*', function(request, response) {
	response.writeHead(404);
	response.end('404');
});

server.listen(port);

console.log('server running on port',port);

process.on('uncaughtException', function(err) { console.log(err.stack) });