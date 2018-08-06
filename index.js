var app = require('express')();
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', req.headers.origin);
	res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept');
	next();
});

var mysql = require('mysql');
var db = function() {
	var pool = mysql.createPool({
		database: 'testdb',
		username: 'root',
		password: ''
	});
	this.getMysqlConnAndRun = function(cb, after) {
		pool.getConnection(function(err, con) {
			if(err) cb(err, null, 'Connection to mysql failed');
			else after(con, cb);
		});
	}
	this.queryErrSucc = function(query, args, after) {
		return function(con, cb) {
			var sql = con.query(query, args, function(err, results) {
				con.release();
				after(err, results);
			})
		}
	}
}

var utils = function() {
	this.generalCallback = function(res) {
		return function(err, data, msg) {
			if(err) res.status(400).send({status:'FAILURE', data: null, err, msg});
			else res.status(200).send({status:'SUCCESS', data, err: null, msg});
		}
	}
}

app.get('/', function(req, res) {
	var cb = utils.generalCallback(res);
	var query = 'select * from users where userid=?';
	var args = [1];
	db.getMysqlConnAndRun(db.queryErrSucc(query, args, function(err, results) {
		if(err) cb(err, null, 'Error fetching users')
		else {
			cb(null, results, 'Fetched users');
		}
	}));
});

app.listen(4040);
