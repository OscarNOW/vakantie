const api = require('../setup/preload/api.js').execute();
const settings = require('../../settings.json');
const messages = require(`../../${settings.generic.path.files.messages}${settings.generic.lang}.json`);

const isModuleInstalled = require('../functions/isModuleInstalled.js').execute;
const errorCode = require('../functions/error/errorCode.js').execute;
const parseErrorOnline = require('../functions/error/parseErrorOnline.js');

module.exports = {
    execute(request, response, parseError) {
        let parseError = (error, customText) => parseErrorOnline(error, response, customText);

        let path = require('../functions/parse/apiCall.js').execute(request.url);

        if (api[path]) {
            if (api[path].enabled.dependencies.installed) {
                let ex = api[path].file;

                let exists = true;
                try {
                    if (!ex.execute) exists = false;
                } catch {
                    exists = false;
                }
                //if (!exists) errorCode(response, 500, { text: messages.error.executeFunctionNotFound })
                if (!exists) return parseError(new Error(messages.error.executeFunctionNotFoundWithFile.replace('{file}', path)), messages.error.executeFunctionNotFound);

                let extra = {
                    isModuleInstalled
                };

                if (request.method == 'POST') {
                    let body = '';
                    request.on('data', function (data) {
                        body += data;
                    });
                    request.on('end', async function () {
                        let cont = {};
                        body.split('&').forEach((val, index) => {
                            let key = decodeURIComponent(val.split('=')[0].replace(/\+/g, ' '));
                            let value = decodeURIComponent(val.split('=')[1].replace(/\+/g, ' '));
                            cont[key] = decodeURIComponent(value);
                        });
                        params = cont;
                        ex.execute(
                            (code, text) => {
                                errorCode(response, code, { text: text });
                            },
                            parseError,
                            (data) => {
                                response.end(data);
                            },
                            request,
                            extra,
                            params,
                            response
                        );
                    });
                } else {
                    ex.execute(
                        (code, text) => {
                            errorCode(response, code, { text: text });
                        },
                        parseError,
                        (data) => {
                            response.end(data);
                        },
                        request,
                        extra,
                        params,
                        response
                    );
                }
            } else {
                if (isModuleInstalled('text')) {
                    let list = require(`../../${settings.generic.path.files.modules}text/createList.js`).createList(api[path].enabled.dependencies.dependenciesNotInstalled);
                    return parseError(new Error(messages.error.moduleNotInstalledForShort.replace('{api}', path)), messages.error.modulesNotInstalledFor.replace('{api}', path).replace('{dependencie}', list));
                } else {
                    return parseError(new Error(messages.error.moduleNotInstalledForShort.replace('{api}', path)), messages.error.moduleNotInstalledFor.replace('{api}', path).replace('{dependencie}', api[path].enabled.dependencies.dependenciesNotInstalled[0]));
                }
            }
        } else {
            return errorCode(response, 404, { text: messages.error.apiCallNotFound });
        }

        return;
    }
}