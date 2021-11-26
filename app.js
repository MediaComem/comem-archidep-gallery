import express from 'express';
import createError from 'http-errors';
import log4js from 'log4js';
import { join as joinPath } from 'path';

import { createLogger, root, title } from './config.js';

// Import route implementations.
import indexRouter from './routes/index.js';
import imagesRouter from './routes/images.js';

const app = express();
const logger = createLogger('app');

// Use https://pugjs.org for templates.
app.set('views', joinPath(root, 'views'));
app.set('view engine', 'pug');

app.use(log4js.connectLogger(logger, { level: 'DEBUG' }));
app.use(express.urlencoded({ extended: false }));

// Static files
app.use(express.static(joinPath(root, 'public')));

// Provide title to all views
app.use((req, res, next) => {
  res.locals.title = title;
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/images', imagesRouter);

// Catch 404 and forward to the global error handler.
app.use((req, res, next) => {
  next(createError(404));
});

// Global error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development.
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page.
  res.status(err.status || 500);
  res.render('error');
});

export default app;
