
module.exports = (config, db) => {


    const express = require('express');
    const router = express.Router();

    router.use(require('./api')(config, db));
    router.use(require('./control')(config, db));

    return router;


};
