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

                    let f = t.repairs.messages.main.fixes;
                    let highScore = 0;

                    highScore = Math.max(highScore, f.beginEnd('', '}'));
                    highScore = Math.max(highScore, f.beginEnd('{', ''));
                    highScore = Math.max(highScore, f.beginEnd('{', '}'));

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
                fixes: {
                    beginEnd(begin, end) {
                        const settings = require('../../../settings.json');
                        const fs = require('fs');
                        const messages = fs.readdirSync(settings.generic.path.files.messages);

                        let succesfull = [];

                        messages.forEach(val => {
                            try {
                                JSON.parse(`${fs.readFileSync(`${settings.generic.path.files.messages}${val}`)}`);
                            } catch {

                                try {
                                    JSON.parse(`${begin}${fs.readFileSync(`${settings.generic.path.files.messages}${val}`)}${end}`);

                                    fs.writeFileSync(`${settings.generic.path.files.messages}${val}`, `${begin}${fs.readFileSync(`${settings.generic.path.files.messages}${val}`)}${end}`);
                                    succesfull.push(true);

                                } catch {
                                    succesfull.push(false);
                                }
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