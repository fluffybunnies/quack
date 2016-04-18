/*
*/

var db = require('../lib/db.mysql.js')
,sext = require('sext')
,keyName = 'quack-status'
;


var get = module.exports.get = function(cb){
	var con = db()
		,q = 'select * from settings where name=?'
		,p = [keyName]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		cb(false, createDto(data[0]));
	});
}

module.exports.set = function(status,cb){
	var con = db()
		,q = 'insert into settings (name,`value`,created,updated) values (?,?,?,?) on duplicate key update `value`=?,updated=?'
		,now = Math.floor(Date.now()/1000)
		,p = [keyName,status,now,now,status,now]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		//cb(false, createDto({value:status, updated:now});
		get(cb);
	});
}


function createDto(data){
	var dto = sext({
		id: null
		,name: keyName
		,value: 0
		,created: null
		,updated: null
	}, data);
	return dto;
}
