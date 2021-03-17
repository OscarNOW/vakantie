const fs = require('fs');
const settings = require('../../settings.json');
const mSettings = require('../../../../settings.json');
const messages = require(`../../${settings.path.files.messages}${mSettings.generic.lang}.json`);
const mMessages = require(`../../../../${mSettings.generic.path.files.messages}${mSettings.generic.lang}.json`);
let userdatabase = require(`../../${settings.path.files.userdatabase}`);

module.exports = {
	execute(statusCode, error, end, request, extra, params, response) {
		return end('test');
		try {
			userdatabase = JSON.parse(fs.readFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`));
		} catch (err) {
			return error(err, messages.error.databaseRead);
		}

		if (!params[settings.path.website.loginToken]) return statusCode(400, mMessages.error.notGiven.replace('{argument}', settings.path.website.loginToken));

		let isValidLoginToken = false;
		let uin = null;
		for (const [key, value] of Object.entries(userdatabase)) {
			if (value.login.tokens[params[settings.path.website.loginToken]]) {
				isValidLoginToken = true;
				uin = key;
			}
		}

		if (!isValidLoginToken) return statusCode(400, mMessages.error.notValid.replace('{argument}', settings.path.website.loginToken));
		if (!params[settings.path.website.displayName]) return statusCode(400, mMessages.error.notGiven.replace('{argument}', settings.path.website.displayName));

		userdatabase[uin].displayName = params[settings.path.website.displayName];
		//*
		try {
			fs.writeFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`, JSON.stringify(userdatabase));
		} catch (err) {
			return error(err, messages.error.databaseUpdate);
		} //*/

		end();
	}
};
