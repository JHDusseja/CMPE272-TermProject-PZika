/**
 * Module dependencies.
 */

var express = require('express'), routes = require('./routes'), user = require('./routes/user'), http = require('http'), path = require('path'), fs = require('fs');

var app = express();

var db;

var Client = require('node-rest-client').Client;

var cloudant;

var fileToUpload;

var dbCredentials = {
	dbName : 'pikatravel',
	db2Name: 'pikamos',
	db3Name: 'pikainn',
	db4Name: 'pikapharm'
};

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var multipart = require('connect-multiparty')
var multipartMiddleware = multipart();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, '/views/style')));

// development only
if ('development' == app.get('env')) {
	app.use(errorHandler());
}

function initDBConnection() {
	
	/*if(process.env.VCAP_SERVICES) {
		var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
		// Pattern match to find the first instance of a Cloudant service in
		// VCAP_SERVICES. If you know your service key, you can access the
		// service credentials directly by using the vcapServices object.
		for(var vcapService in vcapServices){
			if(vcapService.match(/cloudant/i)){*/
				dbCredentials.host = "05b5b259-bf53-473b-a364-d94b67e81b8c-bluemix.cloudant.com";
				dbCredentials.port = 443;
				dbCredentials.user = "05b5b259-bf53-473b-a364-d94b67e81b8c-bluemix";
				dbCredentials.password = "736c72e5a8aebc850de223d7baf6925f767b7c1ab43d8acf591b3b45f9a29217";
				dbCredentials.url = "https://05b5b259-bf53-473b-a364-d94b67e81b8c-bluemix:736c72e5a8aebc850de223d7baf6925f767b7c1ab43d8acf591b3b45f9a29217@05b5b259-bf53-473b-a364-d94b67e81b8c-bluemix.cloudant.com";
				
				cloudant = require('cloudant')(dbCredentials.url);
				
				/*// check if DB exists if not create
				cloudant.db.create(dbCredentials.dbName, function (err, res) {
					if (err) { console.log('could not create db ', err); }
				});
				*/
				db = cloudant.use(dbCredentials.dbName);
				db2 = cloudant.use(dbCredentials.db2Name);
				db3 = cloudant.use(dbCredentials.db3Name);
				db4 = cloudant.use(dbCredentials.db4Name);
				//break;
			//}
		//}
		if(db==null){
			console.warn('Could not find Cloudant credentials in VCAP_SERVICES environment variable - data will be unavailable to the UI');
		}
	 else{
		console.warn('VCAP_SERVICES environment variable not set - data will be unavailable to the UI');
		// For running this app locally you can get your Cloudant credentials 
		// from Bluemix (VCAP_SERVICES in "cf env" output or the Environment 
		// Variables section for an app in the Bluemix console dashboard).
		// Alternately you could point to a local database here instead of a 
		// Bluemix service.
		//dbCredentials.host = "REPLACE ME";
		//dbCredentials.port = REPLACE ME;
		//dbCredentials.user = "REPLACE ME";
		//dbCredentials.password = "REPLACE ME";
		//dbCredentials.url = "REPLACE ME";
	}
}

initDBConnection();

// app.get('/sample', function(req, res){
//
// 	var Travel = [
//
//
//
//
//
// 	]
//
// 	db.bulk({docs:Travel}, function(er) {
// 		if (er) {
// 			throw er;
// 		}
//
// 		console.log('Inserted all documents');
// 	});
// });

app.get('/getZikaAffectedData', function(request, response) {
	var results = new Array();
	var d = new Date();
	var x = d.getMonth();
	var y = getMon(x);
	db.list({include_docs:true}, function(err, data) {

		for(var i=0;i<data.rows.length;i++){
			var a = data.rows[i].doc['RISK LEVEL'];
			results.push({latitude: data.rows[i].doc.LATITUDE, longitude: data.rows[i].doc.LONGITUDE, risk: a , pop: data.rows[i].doc['MAY_NOT'], city: data.rows[i].doc['CITY']});

		}


		var results2 = new Array();
		db2.list({include_docs:true}, function(err, data) {

			for(var j=0;j<data.rows.length;j++){
				//console.dir(data.rows[j].doc);
				var a = data.rows[j].doc['RISK LEVEL'];
				results2.push({risk: a , pop: data.rows[j].doc[y]});
			}

		json_response = {
			"statusCode" : 200,
			"results" : results,
			"results2" : results2
		};
		response.header("Access-Control-Allow-Origin", "*");
		response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		response.send(json_response);
	});
	});
});
app.get('/getHotels/:cityname', function(request, response) {

	var results = new Array();

	db3.list({include_docs:true}, function(err, data) {

		for(var i=0;i<data.rows.length;i++) {
			if(data.rows[i].doc['CITY'] == request.params.cityname){
				results.push({latitude: data.rows[i].doc.LATITUDE, longitude: data.rows[i].doc.LONGITUDE, hotel: data.rows[i].doc['RESTAURANTS'] });
			}
		}
		json_response = {
			"statusCode" : 200,
			"results" : results
		};
		response.header("Access-Control-Allow-Origin", "*");
		response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		response.send(json_response);
	});
});

app.get('/getPharmacies/:cityname', function(request, response) {

	var results = new Array();

	db4.list({include_docs:true}, function(err, data) {
		for(var i=0;i<data.rows.length;i++) {
			if(data.rows[i].doc['CITY'] == request.params.cityname){
				results.push({latitude: data.rows[i].doc.LATITUDE, longitude: data.rows[i].doc.LONGITUDE, pharmacy: data.rows[i].doc['PHARMACIES']});
			}
		}
		json_response = {
			"statusCode" : 200,
			"results" : results
		};
		response.header("Access-Control-Allow-Origin", "*");
		response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		response.send(json_response);
	});
});

function getMon(a){
	switch (a){
		case 1: return 'JAN_MOS';
				break;
		case 2: return 'FEB_MOS';
			break;
		case 3: return 'MAR_MOS';
			break;
		case 4: return 'APR_MOS';
			break;
		case 5: return 'MAY_MOS';
			break;
		case 6: return 'JUNE_MOS';
			break;
		case 7: return 'JULY_MOS';
			break;
		case 8: return 'AUG_MOS';
			break;
		case 9: return 'SEPT_MOS';
			break;
		case 10: return 'OCT_MOS';
			break;
		case 11: return 'NOV_MOS';
			break;
		case 12: return 'DEC_MOS';
			break;
	}
}

app.get('/', routes.index);
//app.get('/addHotel', routes.add);


http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
	console.log('Express server listening on port ' + app.get('port'));
});

