const fs = require('fs');
const settings = require('../../../settings.json');
const http = require('http')

let amountError = 0;
let lastError = '';

module.exports = {
    execute(err, callback) {
        let retry = true;

        let currentErr = `${err}`.split('\n')[0];
        if (currentErr == lastError) {
            amountError += 1;
        } else {
            lastError = currentErr;
            amountError = 1;
        }

        fs.writeFileSync(`${settings.generic.path.files.errors}RAW1-${amountError}-${Math.floor(Math.random() * 1000)}.txt`, `${err}`);

        if (amountError > 5) retry = false;
        console.clear();

        if (retry) {

            countDown(5, 1000, ii => {
                console.clear();
                console.log(`Retrying in ${ii} seconds...`);
            });

            setTimeout(callback, 5000);

        } else {
            console.log('No retry, because of looping error')
        }

    },
    getExtremeServer() {
        return http.createServer((r, response) => {
            response.writeHead(500, "The server has an extreme error, please try again later");
            response.end("The server has an extreme error, please try again later");
            console.error("New request in extreme error mode")
        });
    }
}

function asyncTimeout(wait) {
    return new Promise(resolve => setTimeout(resolve, wait))
}

async function countDown(start, wait, callback) {
    let ii = start;
    while (ii > 0) {
        callback(ii);
        ii--;
        await asyncTimeout(wait);
    }
}