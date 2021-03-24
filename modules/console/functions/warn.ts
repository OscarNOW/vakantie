import * as fs from 'fs';
import * as settings from '../settings.json';

module.exports = {
    execute(text) {
        let cConsole: string, buffer = fs.readFileSync(`.${settings.path.files.console}`);
        cConsole = `${cConsole}${text}\n`;
        fs.writeFileSync(`.${settings.path.files.console}`, cConsole);

        console.warn(text);
    }
}