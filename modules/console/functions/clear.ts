import * as fs from 'fs'
import * as settings from '../settings.json'

module.exports = {
    execute() {
        fs.writeFileSync(`.${settings.path.files.console}`, '');
        console.clear();
    }
}