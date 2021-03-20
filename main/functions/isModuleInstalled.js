const fs = require('fs');

module.exports = {
    execute(name) {
        return fs.existsSync(`${settings.generic.path.files.modules}${name}/`);
    }
}