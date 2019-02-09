
module.exports = (config, db) => {


    const router = require('express').Router();
    const moment = require('moment');
    const ObjectId = require('mongodb').ObjectId;


    router.get(`${config.server.apiBaseUrl}/reports-baumfaellungen`, (req, res) => {

        const year = req.query.year || moment().format('YYYY');

        db
            .collection('report-baumfaellungen')
            .find({ reportedDate: { $gte: moment.utc(`${year}-01-01`).toDate(), $lt: moment.utc(`${year}-01-01`).add(1, 'year').toDate() }})
            .toArray()
            .then(baumfaellungen => res.json(baumfaellungen))
            .catch(err => res.status(500).send(err));

    });


    router.get(`${config.server.apiBaseUrl}/reports-baumfaellungen/:reportId`, (req, res) => {

        const reportId = req.params.reportId;

        db
            .collection('report-baumfaellungen')
            .findOne({ _id: ObjectId(reportId) })
            .then(report => res.json(report))
            .catch(err => res.status(500).send(err));

    });


    router.get(`${config.server.apiBaseUrl}/stats-baumfaellungen`, (req, res) => {

        const year = req.query.year;

        const aggregates = [
            { $match: !!year ? { addedDate: { $gte: moment.utc(`${year}-01-01`).toDate(), $lt: moment.utc(`${year}-01-01`).add(1, 'year').toDate() }} : {}}
        ];

        if (req.query['include-months'] === '1') {

            aggregates.push({
                    $group : {
                        _id: { year: { $year: '$addedDate' }, month: { $month: '$addedDate' }},
                        total: { $sum: '$numberOfTrees' }
                    }
                },
            );

            aggregates.push({
                    $group : {
                        _id : '$_id.year',
                        total: { $sum: '$total' },
                        months: {
                            $push: {
                                month: '$_id.month',
                                total: { $sum: '$total' }
                            }
                        }
                    }
                }
            );

        } else {

            aggregates.push({
                    $group : {
                        _id: { $year: '$addedDate' },
                        total: { $sum: '$numberOfTrees' }
                    }
                }
            );

        }

        db
            .collection('baumfaellungen')
            .aggregate(aggregates)
            .toArray()
            .then(stats => res.json(stats))
            .catch(err => res.status(500).send(err));

    });


    router.get(`${config.server.apiBaseUrl}/baumfaellungen`, (req, res) => {

        const year = req.query.year;

        if (!year) {
            return res.status(400).send('Parameter "year" is missing');
        }

        const month = req.query.month;

        if (month) {

            db
                .collection('baumfaellungen')
                .find({ addedDate: { $gte: moment.utc(`${year}-${month}-01`).toDate(), $lt: moment.utc(`${year}-${month}-01`).add(1, 'month').toDate() }})
                .toArray()
                .then(stats => res.json(stats))
                .catch(err => res.status(500).send(err));

        } else {

            db
                .collection('baumfaellungen')
                .find({ addedDate: { $gte: moment.utc(`${year}-01-01`).toDate(), $lt: moment.utc(`${year}-01-01`).add(1, 'year').toDate() }})
                .toArray()
                .then(stats => res.json(stats))
                .catch(err => res.status(500).send(err));

        }

    });


    return router;


};
