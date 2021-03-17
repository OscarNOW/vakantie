const http = require('http');
const mime = require('mime-types');
const fs = require('fs');

const settings = require('./settings.json');

evalErrors();

let messagePath = `./messages/${settings.generic.lang}.json`;
if (!fs.existsSync(messagePath)) throw 'Messages not found!';
let messages = require(messagePath);

//#region PRELOAD
//#region Api
let api = {};
//#region Load website api
addApiCalls('/', settings.generic.path.files.api);
//#endregion
//#region Load module api
fs.readdirSync(settings.generic.path.files.modules).forEach((moduleName) => {
	let apiPath = settings.generic.path.files.moduleApi.replace('{modules}', settings.generic.path.files.modules).replace('{name}', moduleName);
	addApiCalls('/', apiPath);
});
//#endregion
function addApiCalls(websitePath, path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach((apiName) => {
			if (fs.lstatSync(`${path}${apiName}/`).isDirectory()) {
				addApiCalls(`${websitePath}${apiName}/`, `${path}${apiName}/`);
			} else {
				let req = require(`${path}${apiName}`);
				apiName = apiName.split('.js')[0];
				let dependenciesInstalled = true;
				let dependenciesNotInstalled = [];
				if (req.dependencies && req.dependencies.modules) {
					req.dependencies.modules.forEach((val) => {
						if (!fs.existsSync(`${settings.generic.path.files.modules}${val}/`)) {
							dependenciesInstalled = false;
							dependenciesNotInstalled.push(val);
						}
					});
				}
				api[`${websitePath}${apiName}`] = {
					file: require(`${path}${apiName}`),
					enabled: {
						dependencies: {
							installed: dependenciesInstalled,
							dependenciesNotInstalled
						}
					}
				};
				if (!dependenciesInstalled) {
					if (isModuleInstalled('text')) {
						let list = require(`${settings.generic.path.files.modules}text/createList.js`).createList(dependenciesNotInstalled);
						parseErrorRaw(new Error(messages.error.moduleNotInstalledForShort.replace('{api}', `${websitePath}${apiName}`)), messages.error.modulesNotInstalledFor.replace('{api}', `${websitePath}${apiName}`).replace('{dependencie}', list));
					} else {
						parseErrorRaw(new Error(messages.error.moduleNotInstalledForShort.replace('{api}', `${websitePath}${apiName}`)), messages.error.moduleNotInstalledFor.replace('{api}', `${websitePath}${apiName}`).replace('{dependencie}', dependenciesNotInstalled[0]));
					}
					evalErrors();
				}
			}
		});
	}
}
//#endregion
//#endregion

http.createServer(async function (request, response) {
	let parseError = (error, customText) => parseErrorOnline(error, response, customText);

	try {
		if (request.url.toLowerCase().startsWith(settings.generic.path.online.api)) {
			//Als API call
			//return errorCode(response, 500, { text: "customText", errorFile: "customFile" })
			let call = remove(request.url, settings.generic.path.online.api);
			let params = {};
			let path = call;
			if (path.includes('?')) {
				path.split('?')[1]
					.split('&')
					.forEach((val) => {
						params[val.split('=')[0]] = decodeURIComponent(val.split('=')[1].replace(/\+/g, ' '));
					});
				path = path.split('?')[0];
			}
			path = `/${path}`;
			if (api[path]) {
				if (api[path].enabled.dependencies.installed) {
					let ex = api[path].file;

					let exists = true;
					try {
						if (!ex.execute) exists = false;
					} catch {
						exists = false;
					}
					//if (!exists) errorCode(response, 500, { text: messages.error.executeFunctionNotFound })
					if (!exists) return parseError(new Error(messages.error.executeFunctionNotFoundWithFile.replace('{file}', path)), messages.error.executeFunctionNotFound);

					let extra = {
						isModuleInstalled
					};

					if (request.method == 'POST') {
						let body = '';
						request.on('data', function (data) {
							body += data;
						});
						request.on('end', async function () {
							let cont = {};
							body.split('&').forEach((val, index) => {
								let key = decodeURIComponent(val.split('=')[0].replace(/\+/g, ' '));
								let value = decodeURIComponent(val.split('=')[1].replace(/\+/g, ' '));
								cont[key] = decodeURIComponent(value);
							});
							params = cont;
							ex.execute(
								(code, text) => {
									errorCode(response, code, {text: text});
								},
								parseError,
								(data) => {
									response.end(data);
								},
								request,
								extra,
								params,
								response
							);
						});
					} else {
						ex.execute(
							(code, text) => {
								errorCode(response, code, {text: text});
							},
							parseError,
							(data) => {
								response.end(data);
							},
							request,
							extra,
							params,
							response
						);
					}
				} else {
					if (isModuleInstalled('text')) {
						let list = require(`${settings.generic.path.files.modules}text/createList.js`).createList(api[path].enabled.dependencies.dependenciesNotInstalled);
						return parseError(new Error(messages.error.moduleNotInstalledForShort.replace('{api}', path)), messages.error.modulesNotInstalledFor.replace('{api}', path).replace('{dependencie}', list));
					} else {
						return parseError(new Error(messages.error.moduleNotInstalledForShort.replace('{api}', path)), messages.error.moduleNotInstalledFor.replace('{api}', path).replace('{dependencie}', api[path].enabled.dependencies.dependenciesNotInstalled[0]));
					}
				}
			} else {
				return errorCode(response, 404, {text: messages.error.apiCallNotFound});
			}

			return;
		} else {
			//Als geen API call
			//#region Path eval
			let path = request.url.toLowerCase();
			if (path.includes('?')) path = path.split('?')[0];

			let orgPath = path;
			if (path.split('/')[1] && path.split('/')[2]) {
				if (path.split('/')[1] == path.split('/')[2]) {
					path = `/${path.split('/').splice(2).join('/')}`;
				}
			}
			if (!path.split('/')[path.split('/').length - 1].includes('.')) {
				if (!path.endsWith('/')) path = `${path}/`;
				path = `${path}index.html`;
			}
			path = `./files${path}`;

			if (!fs.existsSync(path)) {
				let newPath = `/${orgPath.split('/').splice(2).join('/')}`;
				if (!newPath.split('/')[newPath.split('/').length - 1].includes('.')) {
					if (!newPath.endsWith('/')) newPath = `${newPath}/`;
					newPath = `${path}index.html`;
				}
				newPath = `./files${newPath}`;
				if (fs.existsSync(newPath)) path = newPath;
			}
			//#endregion
			//#region urlData(key)
			function urlData(k) {
				let key = k;

				if (key == 'messageId') key = 'message';
				if (key == 'userId') key = 'user';

				if (!request.url.toLowerCase().includes('?')) return false;
				if (!request.url.includes(`${key}=`)) return false;

				if (k == 'message') return messages.list[request.url.split(`${key}=`)[1].split('&')[0]];
				if (k == 'user') return users.list[request.url.split(`${key}=`)[1].split('&')[0]];

				return request.url.split(`${key}=`)[1].split('&')[0];
			}
			//#endregion

			if (fs.existsSync(path)) {
				fs.readFile(path, async function (err, data) {
					if (err) throw err;
					let newData = data;

					response.writeHead(200, {'Content-Type': mime.lookup(path)});
					return response.end(newData);
				});
			} else {
				if (path.includes('.html')) {
					errorCode(response, 404);
				} else {
					return response.end();
				}
			}
		}
	} catch (err) {
		parseError(err);
	}
}).listen(process.env.PORT || 80);

//#region remove(string, remove)
function remove(string, remove) {
	return string.split(remove).join('');
}
//#endregion
//#region errorCode(response, code)
function errorCode(response, code, extra) {
	response.writeHead(code, {'Content-Type': 'text/plain'});
	if (!extra) extra = {};
	let errorFile = extra.errorFile;
	let customText = extra.text;
	let text = '';

	let errorMessage = messages.httpStatusCodes[(code + '').split('')[0] * 100];
	if (errorMessage) if (errorMessage[code]) text += errorMessage[code];

	let path = './files/error/index.html';

	fs.readFile(path, async function (err, data) {
		if (err) throw err;
		let newData = data;

		let newText = newData.toString('utf-8').replace('|errorCode|', code).replace('|errorCodeMessage|', text);
		newData = Buffer.from(newText, 'utf-8');

		if (errorFile) {
			newText = newData.toString('utf-8').replace('|errorFile|', errorFile);
			newData = Buffer.from(newText, 'utf-8');
		}

		if (customText) {
			newText = newData.toString('utf-8').replace('|errorMessage|', customText);
			newData = Buffer.from(newText, 'utf-8');
		}

		response.writeHead(code, {'Content-Type': mime.lookup(path)});
		return response.end(newData);
	});
}
//#endregion
//#region _encode(obj)
function _encode(obj) {
	let string = '';

	for (const [key, value] of Object.entries(obj)) {
		if (!value) continue;
		string += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
	}

	return string.substring(1);
}
//#endregion
//#region removeHtml(html)
function removeHtml(string) {
	let newContent = string.split('');
	//let htmlCount = 0;
	string.split('').forEach((val, index) => {
		//if (val == '<') htmlCount++;
		//if (htmlCount < 0) htmlCount = 0

		//if (htmlCount > 0) {
		//    newContent[index] = 'null';
		//}

		if (val == '<') newContent[index] = '&lt';
		if (val == '>') newContent[index] = '&gt';

		//if (val == '>') htmlCount--;
		//if (htmlCount < 0) htmlCount = 0
	});
	return newContent.join('');
}
//#endregion
//#region parseErrorOnline(error object, response)
function parseErrorOnline(error, response, customText) {
	try {
		let errorMessage = error.stack;
		if (errorMessage === undefined) {
			if (`${error}`) {
				errorMessage = new Error(`${error}`).stack;
			} else {
				error = new Error('Error message is undefined');
				errorMessage = error.stack;
			}
		}

		let file = parseErrorRaw(error, customText);

		evalErrors(`${file}`);
		file = file.split('.txt')[0];
		return errorCode(response, 500, {errorFile: file, text: customText});
	} catch (err) {
		throw err;
	}
}
//#endregion
//#region parseErrorRaw(error, customText)
function parseErrorRaw(error, customText) {
	let errorMessage = error.stack;
	if (errorMessage === undefined) {
		if (`${error}`) {
			errorMessage = new Error(`${error}`).stack;
		} else {
			error = new Error('Error message is undefined');
			errorMessage = error.stack;
		}
	}

	let fileIsSpecial = true;
	let sameFile;

	let files = fs.readdirSync(settings.generic.path.files.errors);

	files.forEach((file) => {
		let data = require(`${settings.generic.path.files.errors}${file}`);

		if (data.errorMessage.split(': ')[1] == errorMessage.split('\n')[0].split(': ')[1]) {
			fileIsSpecial = false;
			sameFile = file;
		}
	});

	if (fileIsSpecial) {
		let date = new Date().getTime();
		let fileName = `${Math.floor(Math.random() * 100000000)}.json`;
		let path = `${settings.generic.path.files.errors}${fileName}`;
		let obj = {
			errorMessage: errorMessage.split('\n')[0],
			occurrences: [
				{
					time: date,
					stack: errorMessage.split('\n')
				}
			]
		};

		let easyAccesPath = null;
		try {
			easyAccesPath = errorMessage.split('\n')[1].split('(')[1].split(')')[0];
		} catch {}
		if(easyAccesPath) obj.occurrences[0].easyAccesPath = easyAccesPath;

		if (customText) obj.occurrences[0].customText = customText;
		fs.writeFileSync(path, JSON.stringify(obj));
		return `${fileName}`;
	} else {
		let date = new Date().getTime();
		let path = `${settings.generic.path.files.errors}${sameFile}`;
		let oldObj = require(path);

		let obj = {
			time: date,
			stack: errorMessage.split('\n')
		};

		let easyAccesPath = null;
		try {
			easyAccesPath = errorMessage.split('\n')[1].split('(')[1].split(')')[0];
		} catch {}
		if(easyAccesPath) obj.easyAccesPath = easyAccesPath;

		if (customText) obj.customText = customText;
		oldObj.occurrences.push(obj);
		fs.writeFileSync(path, JSON.stringify(oldObj));
		return sameFile;
	}
}
//#endregion
//#region evalErrors()
function evalErrors() {
	console.clear();
	try {
		fs.readdir(settings.generic.path.files.errors, (err, files) => {
			if (err) throw err;
			if (files[0]) {
				let message = messages.error.thereAreErrors.replace('{amount}', files.length);
				if (files.length == 1) message = messages.error.thereIsError.replace('{amount}', files.length);

				console.warn(message);
				console.log();
				if (isModuleInstalled('text')) {
					let rows = [];
					files.forEach((val) => {
						let occurrences = require(`${settings.generic.path.files.errors}${val}`).occurrences.length;
						rows.push([`${settings.generic.path.files.errors}${val}`, occurrences]);
					});

					let createDiagram = require(`${settings.generic.path.files.modules}text/createDiagram.js`);
					let diagram = createDiagram.twoColumns(rows, 4, ' ');

					diagram.forEach((val) => {
						console.warn(val);
					});
				} else {
					files.forEach((val) => {
						let occurrences = require(`${settings.generic.path.files.errors}${val}`).occurrences.length;
						console.warn(`${settings.generic.path.files.errors}${val}\t\t${occurrences}`);
					});
				}
				console.log();
				console.warn(message);
			}
		});
	} catch (err) {
		console.warn(err);
	}
}
//#endregion
//#region isModuleInstalled(name)
function isModuleInstalled(name) {
	return fs.existsSync(`${settings.generic.path.files.modules}${name}/`);
}
//#endregion
