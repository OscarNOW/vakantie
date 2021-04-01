const http = require('http');

const server = http.createServer(() => {
    console.log('request')
});

server.listen(8080);

debugger;

console.log(require('../main/functions/error/autoRepair').execute(server));