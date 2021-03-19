import { readdir } from 'fs';

export function execute() {
    console.clear();
    try {
        readdir(settings.generic.path.files.errors, (err, files) => {
            if (err) throw err;
            if (files[0]) {
                let message = messages.error.thereAreErrors.replace('{amount}', files.length);
                if (files.length == 1) message = messages.error.thereIsError.replace('{amount}', files.length);

                console.warn(message);
                console.log();
                if (isModuleInstalled('text')) {
                    let rows = [];
                    files.forEach((val) => {
                        let occurrences = require(`../../../${settings.generic.path.files.errors}${val}`).occurrences.length;
                        rows.push([`${settings.generic.path.files.errors}${val}`, occurrences]);
                    });

                    let createDiagram = require(`../../../${settings.generic.path.files.modules}text/createDiagram.js`);
                    let diagram = createDiagram.twoColumns(rows, 4, ' ');

                    diagram.forEach((val) => {
                        console.warn(val);
                    });
                } else {
                    files.forEach((val) => {
                        let occurrences = require(`../../../${settings.generic.path.files.errors}${val}`).occurrences.length;
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