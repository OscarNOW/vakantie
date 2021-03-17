module.exports = {
    execute(statusCode, error, end, request, extra, params, response) {
        end(JSON.stringify(require('../index.js').getRequestInfo(request)))
    }
}