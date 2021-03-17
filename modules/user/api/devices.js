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
		if (!params[settings.path.website.loginToken]) return statusCode(400, mMessages.notGiven.replace('{argument}', settings.path.website.loginToken));
		let uin = null;
		for (const [key, value] of Object.entries(userdatabase)) {
			if (value.login.tokens[params[settings.path.website.loginToken]]) uin = key;
		}
		if (!uin) return statusCode(400, mMessages.notValid.replace('{argument}', settings.path.website.loginToken));

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
