module.exports = {
    execute(server) {
        let t = require(__filename);

        let changed = [];
        let logs = [];
        let currentReturn;

        server.close();

        currentReturn = t.repairs.messages.main.fix();
        changed = changed.concat(currentReturn.changed)
        logs = logs.concat(currentReturn.logs)

        return {
            changed,
            logs
        }

    },
    repairs: {
        messages: {
            main: {
                fix() {
                    let t = require(__filename);
                    if (!t.repairs.messages.main.test()) return null;

                    let f = t.repairs.messages.main.fixes;

                    let changed = [];
                    let logs = [];
                    let currentReturn;

                    currentReturn = f.beginEnd('', '}');
                    changed = changed.concat(currentReturn.changed)
                    logs = logs.concat(currentReturn.logs)

                    currentReturn = f.beginEnd('{', '');
                    changed = changed.concat(currentReturn.changed)
                    logs = logs.concat(currentReturn.logs)

                    currentReturn = f.beginEnd('{', '}');
                    changed = changed.concat(currentReturn.changed)
                    logs = logs.concat(currentReturn.logs)

                    return {
                        changed,
                        logs
                    };
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

                        let changed = [];
                        let logs = [];

                        messages.forEach(val => {
                            try {
                                JSON.parse(`${fs.readFileSync(`${settings.generic.path.files.messages}${val}`)}`);
                            } catch {

                                try {
                                    JSON.parse(`${begin}${fs.readFileSync(`${settings.generic.path.files.messages}${val}`)}${end}`);

                                    fs.writeFileSync(`${settings.generic.path.files.messages}${val}`, `${begin}${fs.readFileSync(`${settings.generic.path.files.messages}${val}`)}${end}`);
                                    changed.push({
                                        tag: 'changedJson',
                                        begin,
                                        end
                                    })

                                } catch {
                                    logs.push({
                                        tag: 'error',
                                        value: err
                                    })
                                }
                            }
                        });

                        return {
                            changed,
                            logs
                        }

                    }
                }
            }
        },
        modules: {
            node_modules() {
                let changed = [];
                try {
                    const settings = require('../../../settings.json');
                    const fs = require('fs');

                    let installmodules = [];

                    let modules = fs.readdirSync(settings.generic.path.files.modules);
                    modules.forEach(val => {
                        let apiPath = settings.generic.path.files.moduleApi.replace('{modules}', settings.generic.path.files.modules).replace('{name}', val);
                        if (fs.existsSync(apiPath)) {
                            let apis = fs.readdirSync(apiPath);
                            apis.forEach(api => {
                                try {
                                    let apiFile = require(`../../.${settings.generic.path.files.moduleApi.replace('{modules}', settings.generic.path.files.modules).replace('{name}', val)}${api}`);
                                    if (apiFile.dependencies?.node_modules) {
                                        apiFile.dependencies.node_modules.forEach(val => {
                                            try {
                                                require.resolve(val);
                                            } catch {
                                                installmodules.push(val);
                                                changed.push({
                                                    tag: 'installedNodeModule',
                                                    value: val
                                                });
                                            }
                                        })
                                    }
                                } catch { }
                            })
                        }
                    })

                    require(`../installNodeModule`).execute(installmodules)
                } catch (err) {
                    return {
                        changed,
                        logs: [{
                            tag: 'error',
                            value: err
                        }]
                    }
                }
            }
        }
    }
}