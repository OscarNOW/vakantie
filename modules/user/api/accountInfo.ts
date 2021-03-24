import * as fs from 'fs';
const settings = require('../settings.json');
const mSettings = require('../../../settings.json');
const messages = require(`../${settings.path.files.messages}${mSettings.generic.lang}.json`);
const mMessages = require(`../../../${mSettings.generic.path.files.messages}${mSettings.generic.lang}.json`);
let userdatabase = require(`../${settings.path.files.userdatabase}`);

module.exports = {
	execute(argument) {
		const { statusCode, error, end, params } = argument;

		try {
			let stringUD: any = fs.readFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`)
			userdatabase = JSON.parse(stringUD);
		} catch (err) {
			return error(err, messages.error.databaseRead);
		}

		let publicUserObject = {};

		if (params[settings.path.online.loginToken]) {
			let hasValidLoginToken = false;
			let uin = null;

			for (const [key, v] of Object.entries(userdatabase)) {
				let value: any = v;
				if (value.login.tokens[params[settings.path.online.loginToken]]) {
					hasValidLoginToken = true;
					uin = key;
				}
			}
			if (!hasValidLoginToken) return statusCode(401, mMessages.error.notValid.replace('{argument}', settings.path.online.loginToken));

			for (const [key, v] of Object.entries(settings.defaultAccountPublicSettings)) {
				let value: any = v;
				if (value.editable || value.default == true) {
					let addObject = findCorrectValue(' > ', userdatabase[uin], key);
					publicUserObject = addToObject(publicUserObject, addObject, key, ' > ');
				}
			}
		} else {
			if (!params[settings.path.online.account]) return statusCode(400, mMessages.error.notGiven.replace('{argument}', settings.path.online.account));
			let uin = params[settings.path.online.account];
			if (!userdatabase[uin]) return statusCode(400, mMessages.error.notValid.replace('{argument}', settings.path.online.account));

			for (const [key, v] of Object.entries(settings.defaultAccountPublicSettings)) {
				let value: any = v;
				let isPublic = false;
				if (!value.editable) isPublic = value.default;
				if (value.editable && userdatabase[uin].publicSettings[key] == undefined) isPublic = value.default;
				if (isPublic) {
					let addObject = findCorrectValue(' > ', userdatabase[uin], key);
					publicUserObject = addToObject(publicUserObject, addObject, key, ' > ');
				}
			}

			for (const [key, v] of Object.entries(userdatabase[uin].publicSettings)) {
				let value: any = v;

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
	if (!(typeof newObject == 'object')) return newObject;
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
