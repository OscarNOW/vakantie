const fs = require('fs');
const settings = require('../../settings.json');
const mSettings = require('../../../../settings.json');
const messages = require(`../../${settings.path.files.messages}${mSettings.generic.lang}.json`);
const mMessages = require(`../../../../${mSettings.generic.path.files.messages}${mSettings.generic.lang}.json`);
let userdatabase = require(`../../${settings.path.files.userdatabase}`);

module.exports = {
    execute(argument) {
        const { params, end, statusCode, error } = argument;

        try {
            userdatabase = JSON.parse(fs.readFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`));
        } catch (err) {
            return error(err, messages.error.databaseRead);
        }

        if (!params[settings.path.online.loginToken]) return statusCode(400, mMessages.error.notGiven.replace('{argument}', settings.path.online.loginToken));

        let isValidLoginToken = false;
        let uin = null;
        for (const [key, v] of Object.entries(userdatabase)) {
            let value: any = v;
            if (value.login.tokens[params[settings.path.online.loginToken]]) {
                isValidLoginToken = true;
                uin = key;
            }
        }

        if (!isValidLoginToken) return statusCode(400, mMessages.error.notValid.replace('{argument}', settings.path.online.loginToken));
        if (!params[settings.path.online.email]) return statusCode(400, mMessages.error.notGiven.replace('{argument}', settings.path.online.email));

        userdatabase[uin].login.cridentials.email = params[settings.path.online.email];
        userdatabase[uin].login.tokens = {};

        //*
        try {
            fs.writeFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`, JSON.stringify(userdatabase));
        } catch (err) {
            return error(err, messages.error.databaseUpdate);
        } //*/

        end();

    }
}