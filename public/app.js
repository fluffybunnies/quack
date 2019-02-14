
(function(){

	// ----- Config
	var config = {
		apiPrefix: '/api/'
	}


	// ----- Namespace
	this.quack = {
		config: config
		,api: api
		,Admin: Admin
		,listen: startListening
	};


	// ----- Quack!
	var quacking = false 
		,videoId = 'YwNdDHEhm2g' //'LoR3qnpyu38'
		,videoLength = 25000 //4500
		,videoStart = 1
		,quackingTimeout = null
		,$quacker = $('#quacker')
	var listening = false
		,listenStatusCheckInterval = 1000
		,listenTimeout = null
	function startListening(){
		if (listening) return;
		listening = true;
		(function getStatus(){
			api('status',function(err,data){
				if (err) {
					console.log('ERROR', err);
				} else if (data.value == 1) {
					console.log('quacking is on....');
					startQuacking();
				} else {
					console.log('quacking is off....');
					stopQuacking();
				}
				listenTimeout = setTimeout(getStatus,listenStatusCheckInterval)
			});
		}());
	}
	function stopListening(){
		listening = false;
		clearTimeout(listenTimeout);
		stopQuacking();
	}
	function startQuacking(){
		if (quacking) return;
		quacking = true;
		(function quack(){
			console.log('QUACK!');
			//if ($quacker) $quacker.remove();
			//$quacker = $('<iframe src="//www.youtube.com/embed/'+videoId+'?autoplay=1&start='+videoStart+'" frameborder="0" style="width:0;height:0;position:absolute;left:-1px;top:-1px;"></iframe>');
			//$('body').append($quacker);
			//$quacker.bind('load',function(){
			//	quackingTimeout = setTimeout(quack,videoLength);
			//});

			$('#quacker').attr('src','//www.youtube.com/embed/'+videoId+'?autoplay=1&start='+videoStart+'&'+Date.now()).bind('load',function(){
				quackingTimeout = setTimeout(quack,videoLength)
			})
		}());
	}
	function stopQuacking(){
		quacking = false;
		clearTimeout(quackingTimeout);
		if ($quacker) {
			//$quacker.remove();
			//$quacker = null;

			$quacker.attr('src','//www.youtube.com/embed/'+videoId+'?autoplay=0&start='+videoStart)
		}
	}



	// ----- Admin
	function Admin($cont, opts){
		var z = this;
		z.$ = {};
		z.opts = $.extend({},z.config.defaultOptions,opts);

		z.build();
		z.functionalize();
		z.refreshStatus();

		$cont.html(z.$.cont);
	}
	Admin.prototype.config = {
		key: 'Admin'
		,defaultOptions: {}
	}
	Admin.prototype.build = function(){
		var z = this, x = z.config.key;
		z.$.cont = $('<div class="'+x+'">'
			+ '<div class="'+x+'-status"></div>'
			+ '<div class="'+x+'-controls">'
				+ '<input type="password" name="apiKey" />'
				+ '<a class="'+x+'-btn '+x+'-btn-enable" href="#">Turn Quack On</a>'
				+ '<a class="'+x+'-btn '+x+'-btn-disable" href="#">Turn Quack Off</a>'
			+ '</div>'
		+ '</div>');
		z.$.status = z.$.cont.find('div.'+x+'-status');
		z.$.apiKey = z.$.cont.find('input[name="apiKey"]');
		z.$.btnOn = z.$.cont.find('a.'+x+'-btn-enable');
		z.$.btnOff = z.$.cont.find('a.'+x+'-btn-disable');
	}
	Admin.prototype.functionalize = function(){
		var z = this, x = z.config.key;
		z.$.btnOn.bind('click',function(e){
			e.preventDefault();
			z.enableQuack();
		});
		z.$.btnOff.bind('click',function(e){
			e.preventDefault();
			z.disableQuack();
		});
	}
	Admin.prototype.refreshStatus = function(){
		var z = this;
		api('status',function(err,data){
			if (err) {
				console.log(z.config.key, 'ERROR', 'refresh', err);
			}
			z.paintStatus(err,data);
		});
	}
	Admin.prototype.paintStatus = function(err,status){
		var z = this
		if (err) {
			//return z.$.status.addClass('has-error').html(err.message ? err.message : err);
			return z.$.status.addClass('has-error').html(JSON.stringify(err));
		}
		var isQuacking = status.value == 1;
		z.$.status.removeClass('has-error is-on is-off').addClass('is-'+(isQuacking?'on':'off')).html(isQuacking ? 'Quaaack!' : 'Zzzz....');
	}
	Admin.prototype.enableQuack = function(){
		var z = this;
		api('status','post',{
			apiKey: z.$.apiKey.val()
			,status: 1
		},function(err,data){
			if (err) {
				console.log(z.config.key, 'ERROR', 'enable', err);
			}
			z.paintStatus(err,data);
		});
	}
	Admin.prototype.disableQuack = function(){
		var z = this;
		api('status','post',{
			apiKey: z.$.apiKey.val()
			,status: 0
		},function(err,data){
			if (err) {
				console.log(z.config.key, 'ERROR', 'disable', err);
			}
			z.paintStatus(err,data);
		});
	}


	// ----- Api
	function api(/* method must come after url */){
		var method = 'get'
			,url,data,opts,showLoader,cb,i
		for (i=0;i<arguments.length;++i) {
			switch (typeof arguments[i]) {
				case 'string': url ? method = arguments[i] : url = arguments[i]; break;
				case 'object': data ? opts = arguments[i] : data = arguments[i]; break;
				case 'function': cb = arguments[i]; break;
				case 'boolean': showLoader = arguments[i]; break;
			}
		}
		url = config.apiPrefix + (url[0] == '/' ? url.substr(1) : url);
		//showLoader && quack.loader.up();
		$.ajax({
			url: url
			,data: data
			,method: method // jQuery v1
			,type: method // jQuery v2
			,dataType: 'json'
			,complete: function(res){
				var undef;
				//showLoader && quack.loader.down();
				// BEGIN handle jquery not returning responseJSON (wrong content-type or not an object)
				if (res && !res.responseJSON && res.responseText) {
					try {
						res.responseJSON = JSON.parse(res.responseText);
					} catch (e){}
				}
				// END handle jquery not returning responseJSON (wrong content-type or not an object)
				if (!(res && res.responseJSON))
					return cb({error:'unexpected response from api', code:0});
				if (res.responseJSON.code !== undef || res.responseJSON.error !== undef) {
					if (!res.responseJSON.code)
						res.responseJSON.code = -1;
					if (typeof res.responseJSON.error == 'object')
						res.responseJSON.error = JSON.stringify(res.responseJSON.error);
					return cb(res.responseJSON);
				}
				cb(false, res.responseJSON);
			}
		});
	}


}());