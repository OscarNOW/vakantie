const http = require('http');
const settings = require('./settings.json');

//Evaluate errors
require('./main/functions/error/evalErrors').execute();

http.createServer(                                  //Create server
    require('./main/server/main').execute           //Server function
).listen(process.env.PORT || settings.generic.port);//Listen to server