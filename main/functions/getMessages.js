const settings = require('../../settings.json');
const fs = require('fs');

module.exports = {
    execute() {
        let path = `../../${settings.generic.path.files.messages}${settings.generic.path}.json`;
        if (!fs.existsSync(path)) throw 'Messages not found';
        return require(path);
    }
}