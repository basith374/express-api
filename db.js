var mysql = require('mysql');
var pool = mysql.createPool({
	database: 'testdb',
	user: 'root',
	password: ''
});
exports.getMysqlConnAndRun = function(cb, after) {
	pool.getConnection(function(err, con) {
		if(err) cb(err, null, 'Connection to mysql failed');
		else after(con, cb);
	});
}
exports.queryErrSucc = function(query, args, after) {
	return function(con, cb) {
		var sql = con.query(query, args, function(err, results) {
			con.release();
			after(err, results);
		})
	}
}
