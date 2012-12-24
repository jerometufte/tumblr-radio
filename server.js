
/**
 * Module dependencies.
 */

var express = require('express');
var fs = require('fs');

var app = module.exports = express.createServer();

var store  = new express.session.MemoryStore;
var OAuth= require('oauth').OAuth;

app.use( express.cookieParser() );
app.use( express.session({ secret: "stupidsecrete", store: store }) );
app.use( express.bodyParser() );

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
	app.set("view engine", "hbs");
	app.set("view options", {layout: false});
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// OAuth
var oa = new OAuth(
	"http://www.tumblr.com/oauth/request_token",
	"http://www.tumblr.com/oauth/access_token",
	"2uX5TNRFVN34hFvuBdRpkSVPxE6M9SwXNysqUYyVGaxxyUcyzU",
	"zJ1aSXvCH6ZW9RGWyFuIIGagnqgpmRwRFddwkdXi9KFfX6bmep",
	"1.0",
	"http://127.0.0.1:3000/auth/tumblr/callback",
	"HMAC-SHA1"
);

// Routes

app.get('/', function(req, res){
	if (req.session.oauth && !req.cookies.trAccessToken) {
		console.log(req.cookies);
    res.cookie('trAccessToken', req.session.oauth.access_token, {
      maxAge: 3600000,
    });
    res.cookie('trAccessSecret', req.session.oauth.access_token_secret, {
      maxAge: 3600000,
    });
	} elseif (req.session.oauth && !req.cookies.trAccessToken && )
	res.render('index', { title: 'TUMBLRADIO' });
});

app.get('/auth/tumblr', function(req, res){
	oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
		if (error) {
			console.log(error);
			res.send("yeah no. didn't work.")
		}
		else {
			req.session.oauth = {};
			req.session.oauth.token = oauth_token;
			console.log('oauth.token: ' + req.session.oauth.token);
			req.session.oauth.token_secret = oauth_token_secret;
			console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
			res.redirect('https://tumblr.com/oauth/authorize?oauth_token='+oauth_token);
	}
	});
});

app.get('/auth/tumblr/callback', function(req, res, next){

	if (req.session.oauth) {
		req.session.oauth.verifier = req.query.oauth_verifier;
		var oauth = req.session.oauth;

		oa.getOAuthAccessToken(
			oauth.token,
			oauth.token_secret,oauth.verifier,
			function(error, oauth_access_token, oauth_access_token_secret, results){
				if (error){
					console.log(error);
					res.send("yeah something broke.");
				} else {
					console.log('auth success callback');
					req.session.oauth.access_token = oauth_access_token;
					req.session.oauth.access_token_secret = oauth_access_token_secret;
					res.redirect('/');
				}
			}
		);
	} else {
		next(new Error("you're not supposed to be here."));
	}
});

app.get('/tumblr/feed', function(req, res, next) {
	if (!req.session.oauth) {
		console.log('attempt to get feed without oath cred');
		return res.send( 'error' );
	}
	oa.get("http://api.tumblr.com/v2/user/dashboard?limit=50", req.session.oauth.access_token, req.session.oauth.access_token_secret, function (error, data, response) {
		if (error) {
			res.send("Error getting tumblr dashboard data : ");
		} else {
			var responseData = JSON.parse(data).response;
			res.send( responseData );
		}
	});
})

// Start server

var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
