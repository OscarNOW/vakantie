module.exports = {
    execute() {

    },
    repairs: {
        messages: {
            main: {
                testError() {
                    const settings = require('../../../settings.json');
                    const fs = require('fs');

                    try {
                        let messages = fs.readdirSync(settings.generic.path.files.messages);

                        messages.forEach(val => {
                            JSON.parse(fs.readFileSync(`${settings.generic.path.files.messages}${val}`));
                        })

                        return false;
                    } catch {
                        return true;
                    }
                }
            }
        }
    }
}