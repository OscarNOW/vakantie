const fs = require('fs');

export function execute(name) {
    return fs.existsSync(`${settings.generic.path.files.modules}${name}/`);
}