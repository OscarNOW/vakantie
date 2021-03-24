const fs = require('fs');
import * as settings from '../../settings.json';

module.exports = {
    execute(name) {
        return fs.existsSync(`${settings.generic.path.files.modules}${name}/`);
    }
}