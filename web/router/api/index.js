
module.exports = (config, db) => {


    const router = require('express').Router();

    router.use(require('./test')(config, db));
    router.use(require('./faellungen')(config, db));
    router.use(require('./nachpflanzungen')(config, db));
    router.use(require('./pflanzstandorte')(config, db));

    return router;


};
