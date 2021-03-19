const fs = require('fs');
const settings = require('../settings.json');
const mSettings = require('../../../settings.json');
const messages = require(`../${settings.path.files.messages}${mSettings.generic.lang}.json`);
const mMessages = require(`../../../${mSettings.generic.path.files.messages}${mSettings.generic.lang}.json`);
let userdatabase = require(`../${settings.path.files.userdatabase}`);

module.exports = {
	execute(statusCode, error, end, request, extra, params, response) {
		try {
			userdatabase = JSON.parse(fs.readFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`));
		} catch (err) {
			return error(err, messages.error.databaseRead);
		}
		if (!params[settings.path.online.loginToken]) return statusCode(400, mMessages.error.notGiven.replace('{argument}', settings.path.online.loginToken));

		let isValidToken = false;
		let uin = null;
		for (const [key, value] of Object.entries(userdatabase)) {
			if (value.login.tokens[params[settings.path.online.loginToken]]) {
				isValidToken = true;
				uin = key;
			}
		}
		if (!isValidToken) return statusCode(400, mMessages.error.notValid.replace('{argument}', settings.path.online.loginToken));

		delete userdatabase[uin].login.tokens[params[settings.path.online.loginToken]];
		//*
		try {
			fs.writeFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`, JSON.stringify(userdatabase));
		} catch (err) {
			return error(err, messages.error.databaseUpdate);
		} //*/

		end();
	}
};
