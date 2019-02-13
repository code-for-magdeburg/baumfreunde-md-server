
module.exports = (config, db) => {


    const router = require('express').Router();
    const authorization = require('../authorization')(config);
    const request = require('request');
    const cheerio = require('cheerio');
    const moment = require('moment');
    const async = require('async');
    const _ = require('lodash');


    function syncBaumfaellungen() {

        return new Promise((resolve, reject) => {

            console.info('Starting request');

            request.get({ uri: config.control.baumfaellungenUrl, encoding: 'binary' }, (err, response, body) => {

                if (err) {
                    return reject(err);
                }

                console.info('Parsing Content');

                const parsedResult = parseBaumfaellungenContent(body);

                // TODO: Report errors
                const parsingErrors = parsedResult.errors;

                console.info('Checking parsed output');

                checkParsedBaumfaellungenResult(parsedResult.entries)
                    .then(checkResult => {

                        if (!checkResult.addedTrees || checkResult.addedTrees.length === 0) {
                            return resolve({ reportId: null, treesTotal: 0, parsingErrors });
                        }

                        console.info('Saving report');

                        saveBaumfaellungenReport(checkResult.addedTrees)
                            .then(saveReportResult =>
                                resolve({
                                    reportId: saveReportResult.reportId,
                                    treesTotal: saveReportResult.treesTotal,
                                    parsingErrors
                                }))
                            .catch(err => reject(err));

                    })
                    .catch(err => reject(err));

            });

        });

    }


    function parseBaumfaellungenContent(body) {

        const entries = [];
        const errors = [];

        const $ = cheerio.load(body, { decodeEntities: false });
        const summary = $('.med_uebersicht');

        summary.children().each((index, element) => {

            try {
                const parsedEntry = parseBaumfaellungenEntry($, element);
                entries.push(parsedEntry);
            } catch(e) {
                errors.push(e);
            }
        });

        return { entries, errors };

    }


    function parseBaumfaellungenEntry($, element) {

        const part1 = $('.col_baum1', element);
        const linkElement = $('a', part1);
        const url = linkElement.attr('href').trim();
        const title = linkElement.text().trim();

        const html = part1.html().trim();

        if (!html.includes('<br>')) {

            throw {
                problem: 'Expected <br> element in part 1 not found.',
                context: $(element).html(),
                entry: { url, title, numberOfTrees: null, addedDate: null }
            };

        }

        const brPos = html.indexOf('<br>');
        const numberOfTrees_Text = html.substring(brPos+4).trim();

        if (!numberOfTrees_Text.startsWith('Anzahl der Bäume:')) {

            throw {
                problem: 'Expected line to start with "Anzahl der Bäume:"',
                context: $(element).html(),
                entry: { url, title, numberOfTrees: null, addedDate: null }
            };

        }

        let numberOfTrees = numberOfTrees_Text.substring('Anzahl der Bäume:'.length).trim();
        if (numberOfTrees.startsWith('ca.')) {
            numberOfTrees = numberOfTrees.substring('ca.'.length).trim();
        }

        if (numberOfTrees === '' || isNaN(numberOfTrees)) {

            throw {
                problem: 'Could not read Number of Trees',
                context: $(element).html(),
                entry: { url, title, numberOfTrees: null, addedDate: null }
            };

        }

        const part2 = $('.col_baum2', element);
        const addedDate_Text = part2.text().trim();

        if (!addedDate_Text.startsWith('Einstellungsdatum:')) {

            throw {
                problem: 'Expected line to start with "Einstellungsdatum:"',
                context: $(element).html(),
                entry: { url, title, numberOfTrees: parseInt(numberOfTrees), addedDate: null }
            };

        }

        const addedDate_Parsed = addedDate_Text.substring('Einstellungsdatum:'.length).trim();
        const addedDate = moment.utc(addedDate_Parsed, 'DD.MM.YYYY').toDate();

        return { url, title, numberOfTrees: parseInt(numberOfTrees), addedDate, parsedDate: new Date() };

    }


    function checkParsedBaumfaellungenResult(entries) {

        return new Promise((resolve, reject) => {

            const updatedTrees = [];
            const addedTrees = [];

            const treesCollection = db.collection('baumfaellungen');
            treesCollection
                .find({})
                .toArray((err, trees) => {

                    if (err) {
                        return reject(err);
                    }

                    async.eachSeries(entries, (entry, callback) => {

                        const tree = _.find(trees, { url: entry.url });
                        if (tree) {

                            if (tree.title !== entry.title || !moment(tree.addedDate).isSame(moment(entry.addedDate))) {

                                tree.title = entry.title;
                                tree.addedDate = entry.addedDate;
                                tree.parsedDate = new Date();

                                treesCollection
                                    .replaceOne({ _id: tree._id }, tree)
                                    .then(result => {
                                        updatedTrees.push(tree);
                                        callback();
                                    })
                                    .catch(err => callback(err));

                            } else {
                                callback();
                            }

                        } else {

                            treesCollection
                                .insertOne(entry)
                                .then(result => {
                                    trees.push(entry);
                                    addedTrees.push(entry);
                                    callback();
                                })
                                .catch(err => callback(err));

                        }

                    }, err => {

                        if (err) {
                            return reject(err);
                        }

                        resolve({ updatedTrees, addedTrees });

                    });

                });

        });

    }


    function saveBaumfaellungenReport(trees) {

        return new Promise((resolve, reject) => {

            const treesTotal = _
                .chain(trees)
                .map('numberOfTrees')
                .reduce((sum, n) => sum+n)
                .value();

            const baumfreundeReport = { treesTotal, trees, reportedDate: new Date() };

            db
                .collection('report-baumfaellungen')
                .insertOne(baumfreundeReport)
                .then(result => resolve({ reportId: result.insertedId, treesTotal }))
                .catch(err => reject(err));

        });

    }


    router.post(`${config.server.controlBaseUrl}/baumfaellungen/sync`, authorization.forceControlAutomationAuthorization, (req, res) => {

        syncBaumfaellungen()
            .then(syncResult => res.json(syncResult))
            .catch(err => res.status(500).send(err));

    });


    return router;


};
