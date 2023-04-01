import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT;
export const ENV = process.env.NODE_ENV;
export const MONGODB_URI = process.env.MONGODB_URI;

export const IS_STAGING = process.env.ENVIRONMENT === 'staging';
export const IS_PRODUCTION = process.env.ENVIRONMENT === 'production';
export const IS_LOCAL =
	process.env.ENVIRONMENT !== 'production' && process.env.ENVIRONMENT !== 'staging';



