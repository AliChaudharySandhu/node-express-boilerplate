import _ from 'lodash';

import ES_Client from './connection';

// ------------- Helper Function --------------------
function parseDocuments(result) {
	return _.map(_.get(result, 'body.hits.hits'), (item) => _.get(item, '_source'));
}
// -------------- Main ES Util Functions -----------------
const additionalParams = { maxRetries: 3 };

export default async function getDocsFromEs(
	index,
	eQuery,
	pagination = { from: 0, size: 10 },
	sort = [{ name: 'asc' }],
	isParsedResult = true
) {
	const { from, size } = pagination;
	const { query = {}, aggs = {}, _source = []} = eQuery;
	try {
		const esResult = await ES_Client.search(
			{
				index,
				type: '_doc',
				body: {
					from,
					size,
					sort,
					track_total_hits: true,
					query,
					_source,
					aggs,
				},
			},
			additionalParams
		);
		if (isParsedResult) {
			const documents = parseDocuments(esResult) || [];
			const totalDocuments = _.get(esResult, 'body.hits.total.value', documents.length);
			if (_.isEmpty(documents)) return { docs: null, total: null };
			return {
				docs: documents,
				total: totalDocuments,
			};
		} else {
			return esResult;
		}
	} catch (err) {
		throw err;
	}
}

export async function getDocsCountFromEs(index) {
	try {
		const esDocsCount = await ES_Client.count(
			{
				index,
				type: '_doc',
			},
			additionalParams
		);
		const total = _.get(esDocsCount, 'body.count');
		if (!total) return null;
		return total;
	} catch (err) {
		throw err;
	}
}

export async function getDomainsFromEs() {
	try {
		const totalDomains = await getDocsCountFromEs('domains');
		if (!totalDomains) return null;
		const { docs: domains } = await getDocsFromEs(
			'domains',
			{ query: { match_all: {}}},
			{ from: 0, size: totalDomains },
			[]
		);
		if (_.isEmpty(domains)) return null;
		return domains;
	} catch (error) {
		throw error;
	}
}
