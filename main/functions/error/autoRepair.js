module.exports = {
    execute() {
        let t = require(__filename);
        let succesfull = [];

        succesfull.push(t.repairs.messages.main.fix());

        if (succesfull.includes(0)) {
            if (succesfull.includes(1) || succesfull.includes(2)) {
                return 1;
            } else {
                return 0;
            }
        } else {
            if (succesfull.includes(1)) {
                return 1;
            } else {
                return 2;
            }
        }

    },
    repairs: {
        messages: {
            main: {
                fix() {
                    let t = require(__filename);
                    if (!t.repairs.messages.main.test()) return null;

                    let f = t.repairs.messages.main.fix;
                    let highScore = 0;

                    highScore = Math.max(highScore, f.endBracket());

                    return highScore;
                },
                test() {
                    const settings = require('../../../settings.json');
                    const fs = require('fs');

                    try {
                        const messages = fs.readdirSync(settings.generic.path.files.messages);

                        messages.forEach(val => {
                            JSON.parse(fs.readFileSync(`${settings.generic.path.files.messages}${val}`));
                        })

                        return false;
                    } catch {
                        return true;
                    }
                },
                fix: {
                    endBracket() {
                        const settings = require('../../../settings.json');
                        const fs = require('fs');
                        const messages = fs.readdirSync(settings.generic.path.files.messages);

                        let succesfull = [];

                        messages.forEach(val => {
                            try {
                                try {
                                    JSON.parse(`${fs.readFileSync(`${settings.generic.path.files.messages}${val}`)}`);
                                } catch {

                                    JSON.parse(`${fs.readFileSync(`${settings.generic.path.files.messages}${val}`)}}`);
                                    fs.writeFileSync(`${settings.generic.path.files.messages}${val}`, `${fs.readFileSync(`${settings.generic.path.files.messages}${val}`)}}`);

                                    succesfull.push(true);

                                }
                            } catch {
                                succesfull.push(false);
                            }
                        });

                        if (succesfull.length == 0) return 0;

                        if (succesfull.includes(true)) {
                            if (succesfull.includes(false)) {
                                return 1;
                            } else {
                                return 2;
                            }
                        } else {
                            return 0;
                        }

                    }
                }
            }
        }
    }
}