const http = require('http');
const settings = require('./settings.json');

//Evaluate errors
require('./main/functions/error/evalErrors').execute();

http.createServer(                                  //Create server
	require('./main/server/main').execute           //Server function
).listen(											//Listen to server
	process.env.PORT				//If hosted on heroku
	||
	settings.generic.port			//Else
);