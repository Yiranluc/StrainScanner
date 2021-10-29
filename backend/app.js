require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const HttpStatus = require('http-status-codes');

const algorithmRouter = require('./routes/algorithm');
const gAuthRouter = require('./routes/google-auth');
const gComputeRouter = require('./routes/google-compute');
const resultsRouter = require('./routes/results');
const workflowRouter = require('./routes/workflow');
const docsRouter = require('./routes/api-docs');
const { databaseConnect } = require('./util/databaseConnections');

databaseConnect();
require('./cromwell/cromwell');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/algorithm', algorithmRouter);
app.use('/google-auth', gAuthRouter);
app.use('/google-compute', gComputeRouter);
app.use('/results', resultsRouter);
app.use('/workflow', workflowRouter);
app.use('/api-docs', docsRouter);

// Vue frontend
app.use('/', serveStatic(path.join(__dirname, '../frontend/dist')));

app.route('/').post(function (req, res) {
  res.sendStatus(HttpStatus.METHOD_NOT_ALLOWED);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(HttpStatus.NOT_FOUND));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page (ignore, node boilerplate)
  /* istanbul ignore next */
  res.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR);
  res.render('error');
});

module.exports = app;
