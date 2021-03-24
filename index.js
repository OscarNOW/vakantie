const http = require('http');
const settings = require('./settings.json');

let server;

server = http.createServer(                         //Create server
	require('./main/server/main').execute           //Server function
);

//Evaluate errors
require('./main/functions/error/evalErrors').execute();

listenToServer();
function listenToServer() {

	server.listen(						//Listen to server
		process.env.PORT				//If hosted on heroku
		||
		settings.generic.port			//Else
	);

}

module.exports = {

	lastFallback(err) {
		const lastFallback = require('./main/functions/error/lastFallback');

		server.close();
		server = lastFallback.getExtremeServer();

		lastFallback.execute(err, listenToServer);

	}

}