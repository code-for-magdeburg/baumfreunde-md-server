const config = require('../config');
const MongoClient = require('mongodb').MongoClient;


MongoClient
    .connect(config.database.url, { useNewUrlParser: true })
    .then(client => {

        const app = require('./server')(config, client.db(config.database.name));

        app.listen(config.server.port || 3000, function () {
            console.log(`server started on port ${this.address().port}`);
        });

    })
    .catch(console.error);
