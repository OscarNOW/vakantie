const fs = require('fs');
const http = require('http');
const settings = require('./settings.json');

let server;
let extremeErrorMode = false;

try {

	throw 'err';

	server = http.createServer(                         //Create server
		require('./main/server/main').execute           //Server function
	);

} catch (err) {
	server = require('./main/functions/error/lastFallback.js').getExtremeServer();
	require('./main/functions/error/lastFallback.js').execute(err, execute);
	extremeErrorMode = true;
}

execute();

function execute() {

	console.clear()

	try {

		//Evaluate errors
		if (!extremeErrorMode)
			require('./main/functions/error/evalErrors').execute();

		server.listen(						//Listen to server
			process.env.PORT				//If hosted on heroku
			||
			settings.generic.port			//Else
		);

	} catch (err) {
		server.close();
		require('./main/functions/error/lastFallback.js').execute(err, execute);
	}

}