
module.exports = (config, db) => {


    const router = require('express').Router();
    const moment = require('moment');
    const ObjectId = require('mongodb').ObjectId;


    router.get(`${config.server.apiBaseUrl}/reports-pflanzstandorte`, (req, res) => {

        const year = req.query.year || moment().format('YYYY');

        db
            .collection('report-pflanzstandorte')
            .find({ reportedDate: { $gte: moment.utc(`${year}-01-01`).toDate(), $lt: moment.utc(`${year}-01-01`).add(1, 'year').toDate() }})
            .toArray()
            .then(pflanzstandorte => res.json(pflanzstandorte))
            .catch(err => res.status(500).send(err));

    });


    router.get(`${config.server.apiBaseUrl}/reports-pflanzstandorte/:reportId`, (req, res) => {

        const reportId = req.params.reportId;

        db
            .collection('report-pflanzstandorte')
            .findOne({ _id: ObjectId(reportId) })
            .then(report => res.json(report))
            .catch(err => res.status(500).send(err));

    });


    router.get(`${config.server.apiBaseUrl}/pflanzstandorte`, (req, res) => {

        db
            .collection('pflanzstandorte')
            .find({ removed: false })
            .toArray()
            .then(pflanzstandorte => res.json(pflanzstandorte))
            .catch(err => res.status(500).send(err));

    });


    return router;


};
