
module.exports = (config, db) => {


    const router = require('express').Router();

    router.get(`${config.server.apiBaseUrl}/test`, (req, res) => {
        res.send('Hello world');
    });


    return router;


};
