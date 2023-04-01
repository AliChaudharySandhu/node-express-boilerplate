import app from './app';
import { ENV, PORT } from './config';
import runCronJobs from './crons';
import routes from './routes';

app.use('/', routes);

runCronJobs();

app.use((err, req, res, next) => {
	if (res.headersSent) return next(err);
	console.error(err.stack);
	res.status(500).send({
		message: 'Internal Error',
		error: err?.message || 'Something went wrong!',
	});
});

app.listen(PORT, () => {
	console.info(`server started on port ${PORT} (${ENV})`); // eslint-disable-line no-console
});

export default app;
