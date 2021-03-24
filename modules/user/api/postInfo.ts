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
		if (!params[settings.path.online.loginToken]) return statusCode(400, mMessages.error.notGiven.replace('{argument}', settings.path.online.loginToken));
		let isValidToken = false;
		let uin = null;
		for (const [key, v] of Object.entries(userdatabase)) {
			let value: any = v;

			if (value.login.tokens[params[settings.path.online.loginToken]]) {
				isValidToken = true;
				uin = key;
			}
		}
		if (!isValidToken) return statusCode(400, mMessages.error.notValid.replace('{argument}', settings.path.online.loginToken));
		if (!params[settings.path.online.info]) return statusCode(400, mMessages.error.notGiven.replace('{argument}', settings.path.online.info));

		let info = null;
		try {
			info = JSON.parse(params[settings.path.online.info]);
		} catch {
			return statusCode(400, mMessages.error.notValid.replace('{argument}', settings.path.online.info));
		}
		if (typeof info != 'object') return statusCode(400, mMessages.error.notValid.replace('{argument}', settings.path.online.info));

		let oldObject = userdatabase[uin].login.tokens[params[settings.path.online.loginToken]];
		let newObject = mergeDeep(oldObject, info);

		userdatabase[uin].login.tokens[params[settings.path.online.loginToken]] = newObject;
		//*
		try {
			fs.writeFileSync(`${mSettings.generic.path.files.modules}user/${settings.path.files.userdatabase}`, JSON.stringify(userdatabase));
		} catch (err) {
			return error(err, messages.error.databaseUpdate);
		} //*/

		end();
	}
};

/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 *
 * @param {...object} objects - Objects to merge
 * @returns {object} New object with merged key/values
 */
function mergeDeep(...objects) {
	const isObject = (obj) => obj && typeof obj === 'object';

	return objects.reduce((prev, obj) => {
		Object.keys(obj).forEach((key) => {
			const pVal = prev[key];
			const oVal = obj[key];

			if (Array.isArray(pVal) && Array.isArray(oVal)) {
				//prev[key] = pVal.concat(...oVal);
				prev[key] = oVal;
			} else if (isObject(pVal) && isObject(oVal)) {
				prev[key] = mergeDeep(pVal, oVal);
			} else {
				prev[key] = oVal;
			}
		});

		return prev;
	}, {});
}
