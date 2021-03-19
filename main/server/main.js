const fs = require('fs');
const settings = require('../../settings.json')
const parseErrorOnline = require('../functions/error/parseErrorOnline').execute;
const errorCode = require('../functions/error/errorCode.js').execute;

export async function execute(request, response) {
    let parseError = (error, customText) => parseErrorOnline(error, response, customText);

    try {
        //*
        if (request.url.toLowerCase().startsWith(settings.generic.path.online.api)) {
            return require('../server/api.js').execute(request, response, parseError);
        } else {
            //Als geen API call
            //#region Path eval
            let path = request.url.toLowerCase();
            if (path.includes('?')) path = path.split('?')[0];

            let orgPath = path;
            if (path.split('/')[1] && path.split('/')[2]) {
                if (path.split('/')[1] == path.split('/')[2]) {
                    path = `/${path.split('/').splice(2).join('/')}`;
                }
            }
            if (!path.split('/')[path.split('/').length - 1].includes('.')) {
                if (!path.endsWith('/')) path = `${path}/`;
                path = `${path}index.html`;
            }
            path = `${settings.generic.path.files.files}${path}`;

            if (!fs.existsSync(path)) {
                let newPath = `/${orgPath.split('/').splice(2).join('/')}`;
                if (!newPath.split('/')[newPath.split('/').length - 1].includes('.')) {
                    if (!newPath.endsWith('/')) newPath = `${newPath}/`;
                    newPath = `${path}index.html`;
                }
                newPath = `${settings.generic.path.files.files}${newPath}`;
                if (fs.existsSync(newPath)) path = newPath;
            }

            if (fs.existsSync(path)) {
                fs.readFile(path, async function (err, data) {
                    if (err) throw err;
                    let newData = data;

                    response.writeHead(200, { 'Content-Type': mime.lookup(path) });
                    return response.end(newData);
                });
            } else {
                if (path.includes('.html')) {
                    errorCode(response, 404);
                } else {
                    return response.end();
                }
            }
        }
    } catch (err) {
        parseError(err);
    }
}