
module.exports = (config, db) => {


    const router = require('express').Router();

    router.use(require('./test')(config, db));
    router.use(require('./baumfaellungen')(config, db));

    return router;


};
