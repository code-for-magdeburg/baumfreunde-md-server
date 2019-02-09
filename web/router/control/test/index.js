
module.exports = (config, db) => {


    const router = require('express').Router();
    const authorization = require('../authorization')(config);


    router.get(`${config.server.controlBaseUrl}/test`, (req, res) => {
        res.send('Hello world');
    });


    router.get(`${config.server.controlBaseUrl}/test-authorized`, authorization.forceControlAutomationAuthorization, (req, res) => {
        res.send('Hello world from authorized route');
    });


    return router;


};
