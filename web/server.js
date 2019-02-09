
module.exports = (config, db) => {


    const express = require('express');
    const app = express();
    const logger = require('morgan');
    const bodyParser = require('body-parser');
    const cors = require('cors');


    app.use(logger('dev'));
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
    app.use(bodyParser.json({ limit: '5mb' }));

    app.use(require('./router/index')(config, db));

    return app;


};
