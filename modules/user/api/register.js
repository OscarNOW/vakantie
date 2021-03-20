const fs = require('fs');
const settings = require('../settings.json');
const mSettings = require('../../../settings.json');
const mMessages = require(`../../../${mSettings.generic.path.files.messages}${mSettings.generic.lang}.json`);
const messages = require(`../${settings.path.files.messages}${mSettings.generic.lang}.json`);
let userdatabase = require(`../${settings.path.files.userdatabase}`);
const sha256 = require('js-sha256').sha256;

module.exports = {
	dependencies: {
		modules: ['random']
	},
	execute(argument) {
		const { statusCode, error, end, params } = argument;

		try {
			userdatabase = JSON.parse(fs.readFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`));
		} catch (err) {
			return error(err, messages.error.databaseRead);
		}

		if (!params[settings.path.online.email]) return statusCode(400, mMessages.notGiven.replace('{argument}', settings.path.online.email));
		let validMailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
		if (!validMailRegex.test(params[settings.path.online.email])) return statusCode(400, mMessages.error.notValid.replace('{argument}', settings.path.online.email));

		let alreadyExist = false;

		for (const [key, value] of Object.entries(userdatabase)) {
			if (value.login.cridentials.email == params[settings.path.online.email]) alreadyExist = true;
		}

		if (alreadyExist) return statusCode(400, messages.error.sameEmailAlreadyExist);
		if (!params[settings.path.online.password]) return statusCode(400, mMessages.error.notGiven.replace('{argument}', settings.path.online.password));

		let userObject = {
			login: {
				cridentials: {
					email: params[settings.path.online.email],
					password: sha256(params.password)
				}
			},
			publicSettings: {}
		};

		if (params[settings.path.online.displayName]) userObject.displayName = params[settings.path.online.displayName];

		let uin = settings.letters.userAccount + require('../../random/index.js').random(10, require('../../random/index.js').chars.nonConfusingNumsAndLetters);

		userdatabase[uin] = userObject;
		//*
		try {
			fs.writeFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`, JSON.stringify(userdatabase));
		} catch (err) {
			return error(err, messages.error.databaseUpdate);
		} //*/

		end(JSON.stringify({ code: 200, uin }));
	}
};
