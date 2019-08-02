function config(app){
    const render = require('koa-ejs');
    render(app, {
        root: `${__dirname}/views`,
        layout: false,
        viewExt: 'ejs',
        cache: false,
        debug: false
    });
}

module.exports.config = config;