const fs = require('fs');
const settings = require('../settings.json');
const mSettings = require('../../../settings.json');
const messages = require(`../${settings.path.files.messages}${mSettings.generic.lang}.json`);
let userdatabase = require(`../${settings.path.files.userdatabase}`);

module.exports = {
	execute(argument) {
		const { statusCode, error, end, params, request } = argument;
		const mMessages = require('../../../main/functions/get/messages').execute({ request }).mainFunction();

		try {
			userdatabase = JSON.parse(fs.readFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`));
		} catch (err) {
			return error(err, messages.error.databaseRead);
		}
		if (!params[settings.path.online.loginToken]) return statusCode(400, mMessages.error.notGiven.replace('{argument}', settings.path.online.loginToken));
		let uin = null;
		for (const [key, value] of Object.entries(userdatabase)) {
			if (value.login.tokens[params[settings.path.online.loginToken]]) uin = key;
		}
		if (!uin) return statusCode(400, mMessages.error.notValid.replace('{argument}', settings.path.online.loginToken));

		let devices = [];

		for (const [key, value] of Object.entries(userdatabase[uin].login.tokens)) {
			let out = value;
			if (out.cookie) delete out.cookie;
			if (out.lang.length > 1) out.lang = [out.lang[0]];
			if (out.lang && out.lang[0].quality) delete out.lang[0].quality;
			if (out.browser && out.browser.version) delete out.browser.version;
			if (out.ip) delete out.ip;
			devices.push(out);
		}

		return end(JSON.stringify(devices));
	}
};
