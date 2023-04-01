import { Client } from '@elastic/elasticsearch';

import { ELASTICSEARCH_API, ELASTICSEARCH_PASSWORD, ELASTICSEARCH_USERNAME } from '../../config';

export const ES_Client = new Client({
	node: ELASTICSEARCH_API,
	auth: {
		username: ELASTICSEARCH_USERNAME,
		password: ELASTICSEARCH_PASSWORD,
	},
});

export default ES_Client;
