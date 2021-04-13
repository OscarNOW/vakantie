const http = require('http');

const server = http.createServer(() => {
    console.log('request')
});

server.listen(8080);

(async function () {
    console.log(await require('../main/functions/error/autoRepair').execute(server));

    while (true) { }
})()