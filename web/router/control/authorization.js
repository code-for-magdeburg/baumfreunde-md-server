
module.exports = config => {


    const forceControlAutomationAuthorization = (req, res, next) => {

        const authorization = req.headers.authorization;

        if (!authorization || !authorization.toLowerCase().startsWith('apikey ') || authorization.split(' ')[1] !== config.control.automationApiKey) {
            return res.status(403).send('Missing or invalid api key');
        }

        next();

    };


    return {
        forceControlAutomationAuthorization
    }


};
