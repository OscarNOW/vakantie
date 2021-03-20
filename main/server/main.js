const settings = require('../../settings.json')
const parseErrorOnline = require('../functions/error/parseErrorOnline').execute;

export async function execute(request, response) {
    let parseError = (error, customText) => parseErrorOnline(error, response, customText);

    try {
        if (request.url.toLowerCase().startsWith(settings.generic.path.online.api)) {
            return require('../server/api.js').execute(request, response, parseError);
        } else {
            return require('./normal.js').execute(request, response);
        }
    } catch (err) {
        parseError(err);
    }
}