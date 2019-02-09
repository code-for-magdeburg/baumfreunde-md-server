
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
        automationApiKey: process.env.CONTROL_AUTOMATION_APIKEY
    }

};
