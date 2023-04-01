import _ from 'lodash';
import dbConnector from './connection';

const DB_DRIVER = dbConnector();

const paramsParser = (params = {}) => {
	const { skip = 0, limit = 20, filter = {}, ...restParams } = params;
	return { filter, skip, limit, ...restParams };
};

const parseWriteObj = (write = {}) => {
	const keys = Object.keys(write);
	const mongoOpsKeys = _.filter(keys, (key) => key.slice(0, 1) === '$');
	const setObj = _.omit(write, mongoOpsKeys);

	const writeObj = _.pick(write, mongoOpsKeys);
	if (!writeObj['$set']) writeObj['$set'] = _.assign({}, setObj);
	else writeObj['$set'] = _.assign({}, writeObj['$set'], setObj);
	return writeObj;
};

export function count(collection, params = {}) {
	return new Promise((resolve, reject) => {
		if (!collection) return reject('Collection cannot be undefined');

		const { filter, select, ...restParams } = paramsParser(params);
		if (restParams) restParams.limit = (params || {}).limit;
		const options = { ...restParams };
		DB_DRIVER((db) => {
			db.collection(collection).countDocuments(filter, options, (err, count) => {
				if (err) return reject(err);
				return resolve(count);
			});
		});
	});
}

export function find(collection, params = {}) {
	return new Promise((resolve, reject) => {
		if (!collection) return reject('Collection cannot be undefined');

		const { skip = 0, limit = 10, filter = {}, select, ...restParams } = params;
		const options = { ...restParams, projection: select };
		console.log(JSON.stringify(params), 'option for find operation');
		DB_DRIVER((db) => {
			db.collection(collection)
				.find(filter, options)
				.skip(Number(skip))
				.limit(Number(limit))
				.toArray((err, docs) => {
					if (err) return reject(err);
					return resolve(docs || []);
				});
		});
	});
}

export function findOne(collection, params = {}) {
	return new Promise((resolve, reject) => {
		if (!collection) return reject('Collection cannot be undefined');

		const { filter, select, ...restParams } = paramsParser(params);
		const options = {
			...restParams,
			projection: select,
			limit: 1,
		};
		DB_DRIVER((db) => {
			db.collection(collection).findOne(filter, options, (err, doc) => {
				if (err) return reject(err);
				return resolve(doc);
			});
		});
	});
}

export function findOneAndUpdate(collection, params = {}) {
	return new Promise((resolve, reject) => {
		if (!collection) return reject('Collection cannot be undefined');

		const { filter, update, options } = params;
		// const options = { ...restParams, projection: select, limit: 1 };
		DB_DRIVER((db) => {
			db.collection(collection).findOneAndUpdate(filter, update, options, (err, doc) => {
				if (err) return reject(err);
				return resolve(doc);
			});
		});
	});
}

export function distinct(collection, key, filter = {}) {
	return new Promise((resolve, reject) => {
		if (!collection) return reject('Collection cannot be undefined');

		DB_DRIVER((db) => {
			db.collection(collection).distinct(key, filter, (err, result) => {
				if (err) return reject(err);
				return resolve(result);
			});
		});
	});
}

export function insert(collection, params = {}) {
	return new Promise((resolve, reject) => {
		if (!collection) return reject('Collection cannot be undefined');
		if (!params || !params.write) return reject('Write Object cannot be undefined');

		const { write, multi = false, ...restParams } = params;
		const options = { ...restParams };
		const insertionMethod = !multi ? 'insertOne' : 'insertMany';
		DB_DRIVER((db) => {
			db.collection(collection)[insertionMethod](write, options, (err, response) => {
				if (err) return reject(err || 'could not insert');
				// const result = response ? response.result : null;
				return resolve(response);
			});
		});
	});
}

export const insertOne = (collection, params = {}) =>
	insert(collection, Object.assign(params, { multi: false }));
export const insertMany = (collection, params = {}) =>
	insert(collection, Object.assign(params, { multi: true }));

export function updateOne(collection, params = {}) {
	return new Promise((resolve, reject) => {
		if (!collection) return reject('Collection cannot be undefined');
		if (!params || !params.write) return reject('Write Object cannot be undefined');

		const { filter, write, ...restParams } = params;
		const writeObj = parseWriteObj(write);
		const options = { ...restParams };
		DB_DRIVER((db) => {
			db.collection(collection).updateOne(filter, writeObj, options, (err, response) => {
				const result = response ? response.result : null;
				if (err || !result || !result.ok) return reject(err || 'could not update');
				return resolve({ updated: result.nModified });
			});
		});
	});
}

export function remove(collection, params = {}) {
	return new Promise((resolve, reject) => {
		if (!collection) return reject('Collection cannot be undefined');

		const { filter = {}, multi = false } = params;
		const deletionMethod = !multi ? 'deleteOne' : 'deleteMany';
		DB_DRIVER((db) => {
			db.collection(collection)[deletionMethod](filter, (err, response) => {
				const result = response ? response.result : null;
				if (err || !result || !result.ok) return reject(err || 'could not delete');
				return resolve({ deleted: result.n });
			});
		});
	});
}

export const removeOne = (collection, params = {}) =>
	remove(collection, Object.assign(params, { multi: false }));
export const removeMany = (collection, params = {}) =>
	remove(collection, Object.assign(params, { multi: true }));

export function aggregate(collection, params = {}) {
	return new Promise((resolve, reject) => {
		if (!collection) return reject('Collection cannot be undefined');

		const { pipeline = [], options = {}} = params;
		DB_DRIVER((db) => {
			db.collection(collection)
				.aggregate(pipeline, options)
				.toArray((err, result) => {
					if (err) return reject(err);
					return resolve(result);
				});
		});
	});
}

export function createIndex(collection, fieldName) {
	return new Promise((resolve, reject) => {
		if (!collection) return reject('Collection cannot be undefined');

		DB_DRIVER((db) => {
			db.createIndex(collection, fieldName, (err, result) => {
				if (err) return reject(err);
				return resolve(result);
			});
		});
	});
}

export function dropCollection(collection) {
	return new Promise((resolve, reject) => {
		if (!collection) return reject('Collection cannot be undefined');

		DB_DRIVER((db) => {
			db.dropCollection(collection, (err, result) => {
				if (err && err.code !== 26) return reject(err); // code 26 is NamespaceNotFound error;
				return resolve(result);
			});
		});
	});
}
