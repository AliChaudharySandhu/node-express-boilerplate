const dbDriver = require('mongo-getdb');

import { MONGODB_URI } from '../../config';

function dbConnector() {
	const connOps = {
		w: 1,
		useNewUrlParser: true,
		socketTimeoutMS: 60000 * 5,
	}; // 5 minutes per query, for crons
	dbDriver.init(MONGODB_URI, connOps);
	return dbDriver;
}
export default dbConnector;
