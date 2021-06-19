const fs = require('fs');
const mime = require('mime-types');

module.exports = {
    execute(request, response) {
        fs.readFile('./files/webapp/index.html', async (err, data) => {
            if (err) throw err;

            data = data.toString().replace('|url|', request.url)

            response.writeHead(200, { 'Content-Type': mime.lookup('.html') });
            return response.end(data);
        });
    }
}