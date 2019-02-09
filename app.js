
const logger = require('winston');

const type = process.env.PROCESS_TYPE;

logger.info(`Starting '${type}' process`, { pid: process.pid });

if (type === 'web') {
    require('./web');
} else if (type === 'some-other-process') {
    require('./worker/some-process-worker');
} else {

    throw new Error(`
        ${type} is an unsupported process type. 
        Use one of: 'web', 'some-other-process'!
  `);

}
