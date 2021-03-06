const fs = require('fs');
const settings = require('../settings.json');
const mSettings = require('../../../settings.json');
const messages = require(`../${settings.path.files.messages}${mSettings.generic.lang}.json`);
const gmMessages = require('../../../main/functions/get/messages').execute().mainFunction();
let userdatabase = require(`../${settings.path.files.userdatabase}`);
const sha256 = require('js-sha256').sha256;

module.exports = {
	dependencies: {
		modules: ['devices', 'requestInfo', 'random']
	},
	execute(argument) {
		const { statusCode, error, end, request, params } = argument;

		try {
			userdatabase = JSON.parse(fs.readFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`));
		} catch (err) {
			return error(err, messages.error.databaseRead);
		}

		if (!params[settings.path.online.account]) return statusCode(400, gmMessages.error.notGiven.replace('{argument}', settings.path.online.account));

		let uin = params[settings.path.online.account];

		if (!userdatabase[uin]) return statusCode(400, gmMessages.error.notValid.replace('{argument}', settings.path.online.account));
		if (!params[settings.path.online.password]) return statusCode(400, gmMessages.error.notGiven.replace('{argument}', settings.path.online.password));
		if (sha256(params[settings.path.online.password]) != userdatabase[uin].login.cridentials.password) return statusCode(400, messages.error.wrongPassword);

		if (!userdatabase[uin].login.tokens) userdatabase[uin].login.tokens = {};

		let loginToken = null;
		let level = 0;

		let requestInfo = require('../../requestInfo/getInfo.js').execute(request, params[settings.path.online.deviceCookie]);
		for (const [key, value] of Object.entries(userdatabase[uin].login.tokens)) {
			let ourLevel = require('../../devices/checkIfSame.js').execute(requestInfo, value);

			if (ourLevel > level) {
				level = ourLevel;
				loginToken = key;
			}
		}

		if (level > 3) {
			userdatabase[uin].login.tokens[loginToken] = requestInfo;
			//*
			try {
				fs.writeFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`, JSON.stringify(userdatabase));
			} catch (err) {
				return error(err, messages.error.databaseUpdate);
			} //*/

			return end(JSON.stringify({ code: 200, loginToken }));
		} else {
			//Maak nieuwe loginToken
			if (!params[settings.path.online.deviceCookie]) {
				let newDeviceCookie =
					settings.letters.deviceCookie											//Letter for device cookie
					+
					require('../../random/random.js').execute(
						10,
						require('../../random/getChars.js').execute(
							{
								letters: true,
								confusingLetters: false,
								numbers: true,
								confusingNumbers: false
							}
						)
					);
			}


			let newToken =
				settings.letters.loginToken
				+
				require('../../random/random.js').execute(
					10,
					require('../../random/getChars.js').execute(
						{
							letters: true,
							confusingLetters: false,
							numbers: true,
							confusingNumbers: false
						}
					)
				);

			userdatabase[uin].login.tokens[newToken] = requestInfo;

			//*
			try {
				fs.writeFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`, JSON.stringify(userdatabase));
			} catch (err) {
				return error(err, messages.error.databaseUpdate);
			} //*/

			return end(JSON.stringify({ code: 200, loginToken: newToken }));
		}
	}
};
