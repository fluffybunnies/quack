var http = require('http')
,querystring = require('querystring')
,fs = require('fs')
,Url = require('url')
,config = require('./config.js')
,status = require('./lib/status.js')
;

var staticPages = {
	'/': 'target.html'
	,'/admin': 'admin.html'
}
,viewsDir = __dirname+'/views/'
,assetsDir = __dirname+'/public/'
,port = config.port || 80
;


http.createServer(function(req,res){
	var path = req.url.split('?')[0];

	// ----- STATIC PAGES
	if (staticPages[path]) {
		fs.readFile(viewsDir+staticPages[path], function(err,data){
			if (err) {
				console.log('ERROR', 'static page', err);
				res.statusCode = 500;
				return res.end();
			}
			res.setHeader('Content-Type', 'text/html')
			res.end(data)
		});


	// ----- ASSETS
	} else if (path.indexOf('/assets/') == 0) {
		var filename = path.replace('/assets/','');
		fs.readFile(assetsDir+filename,function(err,data){
			if (err) {
				if (err.code == 'ENOENT') return nope();
				console.log('ERROR', 'assets', err);
				res.statusCode = 500;
				return res.end();
			}
			res.setHeader('Content-Type', getContentTypeFromFilename(filename));
			res.setHeader('Cache-Control', 'public, max-age=2592000, must-revalidate');
			res.setHeader('Last-Modified', (new Date).toUTCString());
			res.end(data);
		});


	// ----- API
	} else if (path.indexOf('/api/') == 0) {
		var apiPath = path.replace('/api/','');
		collectParams(req,function(params){

			// GET /status
			if (apiPath == 'status' && req.method == 'GET') {
				status.get(function(err,data){
					if (err) {
						console.log('ERROR', 'status.get()', err);
						return apiError(110, err);
					}
					apiSuccess(data);
				});
			}

			// POST /status
			else if (apiPath == 'status' && req.method == 'POST') {
				if (params.apiKey != config.authKey) {
					res.statusCode = 500;
					return res.end();
				}
				if (!params.status) {
					return apiError(101, 'Missing Input')
				}
				status.set(params.status, function(err,data){
					if (err) {
						console.log('ERROR', 'status.set()', err);
						return apiError(110, err);
					}
					apiSuccess(data);
				});
			}

			// Api 404
			else {
				nope();
			}

		});


	// ----- Catch-All 404
	} else {
		return nope()
	}

	function apiSuccess(data){
		res.setHeader('content-type', 'application/json')
		res.statusCode = 200
		res.end(JSON.stringify(data))
	}
	function apiError(code, msg){
		res.setHeader('content-type', 'application/json')
		res.statusCode = 500
		res.end(JSON.stringify({error:msg, code:code}))
	}
	function nope(){
		res.statusCode = 404
		res.end()
	}
})
.listen(port)
;

console.log('listening on port '+port);




function collectParams(req,cb){
	if (req.method == 'GET') {
		try {
			var data = Url.parse(req.url,true).query
		} catch (e) {}
		process.nextTick(function(){
			cb(data && typeof data == 'object' ? data : {})
		})
	} else {
		var buf = new Buffer(0)
		req.on('data',function(data){
			buf = Buffer.concat([buf,data])
		})
		.on('end',function(){
			var data
			try {
				data = querystring.parse(buf.toString())
			} catch (e) {}
			cb(data && typeof data == 'object' ? data : {})
		})
	}
}

function getContentTypeFromFilename(filename){
	var ext = filename.split('.').pop().toLowerCase();
	switch (ext) {
		case 'js': return 'application/javascript';
		case 'css': return 'text/css';
		case 'html': case 'html': return 'text/html';
		case 'jpg': case 'jpeg': case 'gif': case 'png': case 'ico': case 'svg': return 'image/'+(ext=='jpg'?'jpeg':ext);
	}
	return 'text/plain';
}
