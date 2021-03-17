const fs = require('fs');
const settings = require('../../settings.json');
const mSettings = require('../../../../settings.json');
const messages = require(`../../${settings.path.files.messages}${mSettings.generic.lang}.json`);
const mMessages = require(`../../../../${mSettings.generic.path.files.messages}${mSettings.generic.lang}.json`);
let userdatabase = require(`../../${settings.path.files.userdatabase}`);

module.exports = {
	execute(statusCode, error, end, request, extra, params, response) {
		try {
			userdatabase = JSON.parse(fs.readFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`));
		} catch (err) {
			return error(err, messages.error.databaseRead);
		}

		end();
	}
};
