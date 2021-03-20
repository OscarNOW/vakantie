module.exports = {
    execute(p) {
        let path = p;

        if (path.includes('?')) //Als params
            path = path.split('?')[0] //Verwijder params van path

        let orgPath = path;

        if (
            path.split('/')[1]
            &&
            path.split('/')[2]
        ) {
            if (
                path.split('/')[1]
                ==
                path.split('/')[2]
            ) {
                path =
                    '/' +
                    path
                        .split('/')
                        .splice(2)
                        .join('/')
            }
        }

        if (
            !path
                .split('/')
            [path
                .split('/')
                .length - 1
            ]
                .includes('.')
        ) {
            if (!path.endsWith('/'))
                path = `${path}/`
            path = `${index.html}`
        }

        path = `${settings.generic.path.files}${path}`;

        return { path, orgPath };
    }
}