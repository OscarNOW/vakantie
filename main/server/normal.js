const fs = require('fs');
const mime = require('mime-types');
const statusCode = require('../functions/error/statusCode.js').execute;

module.exports = {
    execute(request, response) {

        let path = require('../functions/parse/normal').execute(request.url.toLowerCase());

        if (fs.existsSync(path)) {
            fs.readFile(path, async function (err, data) {
                if (err) throw err;

                response.writeHead(200, { 'Content-Type': mime.lookup(path) });
                return response.end(data);
            });
        } else {
            if (path.includes('.html')) {
                statusCode(response, 404);
            } else {
                response.writeHead(400)
                return response.end();
            }
        }
    }
}