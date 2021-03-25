const settings = require('../../settings.json')
const parseErrorOnline = require('../functions/error/parseErrorOnline').execute;

module.exports = {
    execute(request, response) {
        let parseError = (error, customText) => parseErrorOnline(error, response, customText);

        throw 'newErr';

        try {
            if (request.url.toLowerCase().startsWith(settings.generic.path.online.api)) {
                return require('../server/api.js').execute(request, response);
            } else {
                return require('./normal.js').execute(request, response);
            }
        } catch (err) {
            parseError(err);
        }
    }
}