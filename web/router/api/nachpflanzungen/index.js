
module.exports = (config, db) => {


    const router = require('express').Router();
    const moment = require('moment');
    const ObjectId = require('mongodb').ObjectId;
    const _ = require('lodash');

    const nachpflanzungen = require('./nachpflanzungen.json');


    router.get(`${config.server.apiBaseUrl}/stats-nachpflanzungen`, (req, res) => {

        res.json([
            { _id: 2014, total: _.sumBy(nachpflanzungen.Nachpflanzungen2014, 'anzahl') },
            { _id: 2015, total: _.sumBy(nachpflanzungen.Nachpflanzungen2015, 'anzahl') },
            { _id: 2016, total: _.sumBy(nachpflanzungen.Nachpflanzungen2016, 'anzahl') },
            { _id: 2017, total: _.sumBy(nachpflanzungen.Nachpflanzungen2017, 'anzahl') },
            { _id: 2018, total: _.sumBy(nachpflanzungen.Nachpflanzungen2018, 'anzahl') },
            { _id: 2019, total: _.sumBy(nachpflanzungen.Nachpflanzungen2019, 'anzahl') }
        ]);

    });


    router.get(`${config.server.apiBaseUrl}/nachpflanzungen`, (req, res) => {

        const year = req.query.year || moment().format('YYYY');

        res.json(nachpflanzungen[`Nachpflanzungen${year}`]);

    });


    return router;


};
