const parseErrorRaw = require('./parseErrorRaw').execute;
const evalErrors = require('./evalErrors').execute;
const errorCode = require('./errorCode').execute;

module.exports = {
    execute(error, response, customText) {
        try {
            let errorMessage = error.stack;
            if (errorMessage === undefined) {
                if (`${error}`) {
                    errorMessage = new Error(`${error}`).stack;
                } else {
                    error = new Error('Error message is undefined');
                    errorMessage = error.stack;
                }
            }

            let file = parseErrorRaw(error, customText);

            evalErrors(`${file}`);
            file = file.split('.txt')[0];
            return errorCode(response, 500, { errorFile: file, text: customText });
        } catch (err) {
            throw err;
        }
    }
}