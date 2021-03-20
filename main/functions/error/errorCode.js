const fs = require('fs');
const settings = require('../../../settings.json');
const messages = require(`../../.${settings.generic.path.files.messages}${settings.generic.lang}.json`);

module.exports = {
    execute(response, code, extra) {
        response.writeHead(code, { 'Content-Type': 'text/plain' });
        if (!extra) extra = {};
        let errorFile = extra.errorFile;
        let customText = extra.text;
        let text = '';

        let errorMessage = messages.httpStatusCodes[(code + '').split('')[0] * 100];
        if (errorMessage) if (errorMessage[code]) text += errorMessage[code];

        let path = settings.generic.path.files.errorFile.replace('{file}', settings.generic.path.files.files);

        fs.readFile(path, async function (err, data) {
            if (err) throw err;
            let newData = data;

            let newText = newData.toString('utf-8').replace('|errorCode|', code).replace('|errorCodeMessage|', text);
            newData = Buffer.from(newText, 'utf-8');

            if (errorFile) {
                newText = newData.toString('utf-8').replace('|errorFile|', errorFile);
                newData = Buffer.from(newText, 'utf-8');
            }

            if (customText) {
                newText = newData.toString('utf-8').replace('|errorMessage|', customText);
                newData = Buffer.from(newText, 'utf-8');
            }

            response.writeHead(code, { 'Content-Type': mime.lookup(path) });
            return response.end(newData);
        });
    }
}