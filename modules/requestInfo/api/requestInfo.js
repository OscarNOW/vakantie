module.exports = {
	execute(argument) {
		const { end, request } = argument;

		end(JSON.stringify(require('../index.js').getRequestInfo(request)));
	}
};
