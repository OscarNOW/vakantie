const fs = require('fs');
const settings = require('../settings.json');
const mSettings = require('../../../settings.json');
const pMessages = require(`../../../main/functions/get/messages`).execute().mainFunction();
let userdatabase = require(`../${settings.path.files.userdatabase}`);

module.exports = {
	execute(argument) {
		const { statusCode, error, end, params, request } = argument;
		const mMessages = require('../../../main/functions/get/messages').execute({ request }).mainFunction();

		try {
			userdatabase = JSON.parse(fs.readFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`));
		} catch (err) {
			return error(err, pMessages.error.databaseRead);
		}

		let publicUserObject = {};

		if (params[settings.path.online.loginToken]) {
			let hasValidLoginToken = false;
			let uin = null;

			for (const [key, value] of Object.entries(userdatabase)) {
				if (value.login.tokens[params[settings.path.online.loginToken]]) {
					hasValidLoginToken = true;
					uin = key;
				}
			}
			if (!hasValidLoginToken) return statusCode(401, mMessages.error.notValid.replace('{argument}', settings.path.online.loginToken));

			for (const [key, value] of Object.entries(settings.defaultAccountPublicSettings)) {
				if (value.editable || value.default == true) {
					let addObject = findCorrectValue(' > ', userdatabase[uin], key);
					publicUserObject = addToObject(publicUserObject, addObject, key, ' > ');
				}
			}
		} else {
			if (!params[settings.path.online.account]) return statusCode(400, mMessages.error.notGiven.replace('{argument}', settings.path.online.account));
			let uin = params[settings.path.online.account];
			if (!userdatabase[uin]) return statusCode(400, mMessages.error.notValid.replace('{argument}', settings.path.online.account));

			for (const [key, value] of Object.entries(settings.defaultAccountPublicSettings)) {
				let isPublic = false;
				if (!value.editable) isPublic = value.default;
				if (value.editable && userdatabase[uin].publicSettings[key] == undefined) isPublic = value.default;
				if (isPublic) {
					let addObject = findCorrectValue(' > ', userdatabase[uin], key);
					publicUserObject = addToObject(publicUserObject, addObject, key, ' > ');
				}
			}

			for (const [key, value] of Object.entries(userdatabase[uin].publicSettings)) {
				let isPublic = false;
				if (settings.defaultAccountPublicSettings[key] && settings.defaultAccountPublicSettings[key].editable == true) isPublic = value;

				if (isPublic) {
					let addObject = findCorrectValue(' > ', userdatabase[uin], key);
					publicUserObject = addToObject(publicUserObject, addObject, key, ' > ');
				}
			}
		}

		end(JSON.stringify(publicUserObject));
	}
};

function findCorrectValue(between, object, string) {
	let words = string.split(between);
	let newObject = object[words[0]];
	if (!newObject) return null;
	if (typeof newObject != 'object') return newObject;
	if (words.length == 1) return newObject;
	return findCorrectValue(between, newObject, words.splice(1).join(between));
}

function addToObject(object, newObject, string, between) {
	let words = string.split(between);
	if (words.length == 1) {
		object[words[0]] = newObject;
		return object;
	}

	if (!object[words[0]]) object[words[0]] = {};
	object[words[0]] = addToObject(object[words[0]], newObject, words.splice(1).join(between), between);

	return object;
}
