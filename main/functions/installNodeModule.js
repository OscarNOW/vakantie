const npm = require('npm');
let ready = false;
npm.load(err => {
    if (err) throw err;
    ready = true;
})

module.exports = {
    execute(modules) {
        if (!ready) return false;

        npm.commands.install(modules, err => {
            if (err) throw err;
        })
    }
}