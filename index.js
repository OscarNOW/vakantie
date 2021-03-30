const http = require('http');
const settings = require('./settings.json');

let server;

server = http.createServer(                         				//Create server
	require('./main/functions/error/lastFallback').serverExecute	//Error handler
);

try {

	//Evaluate errors
	require('./main/functions/error/evalErrors').execute();

} catch { }


server.listen(						//Listen to server
	process.env.PORT				//If hosted on heroku
	||
	settings.generic.port			//Else
);