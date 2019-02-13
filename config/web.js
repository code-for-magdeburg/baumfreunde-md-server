
module.exports = {

    server: {
        port: process.env.PORT,
        apiBaseUrl: '/api/v1',
        controlBaseUrl: '/control/v1'
    },

    database: {
        url: process.env.DATABASE_URL,
        name: process.env.DATABASE_NAME
    },

    control: {
        automationApiKey: process.env.CONTROL_AUTOMATION_APIKEY,
        baumfaellungenUrl: 'https://www.magdeburg.de/Start/B%C3%BCrger-Stadt/Verwaltung-Service/Eigenbetriebe/Stadtgarten-Friedh%C3%B6fe/index.php?NavID=37.927&object=tx|698.3733.1&La=1'
    }

};
