export function execute(functions, error, response, customText) {
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

        functions.evalErrors(`${file}`);
        file = file.split('.txt')[0];
        return functions.errorCode(response, 500, { errorFile: file, text: customText });
    } catch (err) {
        throw err;
    }
}