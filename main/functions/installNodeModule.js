const npm = require('npm');
module.exports = {
    execute(modules) {
        return new Promise(resolve => {
            npm.load(err => {
                if (err) throw err;

                npm.commands.install(modules, err => {
                    if (err) throw err;
                    resolve()
                })
            })
        })
    }
}