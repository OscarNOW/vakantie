const http = require('http');

const server = http.createServer(() => {
    console.log('request')
});

server.listen(8080);

(async function () {
    let result = await require('../main/functions/error/autoRepair').execute(server);
    console.log(result.changed)
    console.log(result.logs)

    while (true) { }
})()