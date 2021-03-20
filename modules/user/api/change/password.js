const fs = require('fs');
const settings = require('../../settings.json');
const mSettings = require('../../../../settings.json');
const messages = require(`../../${settings.path.files.messages}${mSettings.generic.lang}.json`);
const mMessages = require(`../../../../${mSettings.generic.path.files.messages}${mSettings.generic.lang}.json`);
let userdatabase = require(`../../${settings.path.files.userdatabase}`);
const sha256 = require('js-sha256').sha256;

module.exports = {
	execute(argument) {
		const { statusCode, error, end, params } = argument;

		try {
			userdatabase = JSON.parse(fs.readFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`));
		} catch (err) {
			return error(err, messages.error.databaseRead);
		}

		if (!params[settings.path.online.loginToken]) return statusCode(400, mMessages.error.notGiven.replace('{argument}', settings.path.online.loginToken));

		let isValidLoginToken = false;
		let uin = null;
		for (const [key, value] of Object.entries(userdatabase)) {
			if (value.login.tokens[params[settings.path.online.loginToken]]) {
				isValidLoginToken = true;
				uin = key;
			}
		}

		if (!isValidLoginToken) return statusCode(400, mMessages.error.notValid.replace('{argument}', settings.path.online.loginToken));
		if (!params[settings.path.online.oldPassword]) return statusCode(400, mMessages.error.notGiven.replace('{argument}', settings.path.online.oldPassword));
		let isCorrectPassword = sha256(params[settings.path.online.oldPassword]) == userdatabase[uin].login.cridentials.password;
		if (!isCorrectPassword) return statusCode(400, mMessages.error.notValid.replace('{argument}', settings.path.online.oldPassword));

		if (!params[settings.path.online.newPassword]) return statusCode(400, mMessages.error.notGiven.replace('{argument}', settings.path.online.newPassword));

		userdatabase[uin].login.cridentials.password = sha256(params[settings.path.online.newPassword]);

		//*
		try {
			fs.writeFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`, JSON.stringify(userdatabase));
		} catch (err) {
			return error(err, messages.error.databaseUpdate);
		} //*/

		end();
	}
};
