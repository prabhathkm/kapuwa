var express       = require('express');
var path          = require('path');
var logger        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var app           = express();
var gaikan        = require('gaikan');
var log           = require('npmlog');
var session       = require('express-session');



// show dev log outputs
app.use(logger('dev'));

//parsing the URL-encoded data with the querystring library (when extended is set false) or the qs library (when extended is set true).
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({limit: '20mb', extended: true}));

app.use(cookieParser());
app.use(session({
  secret: 'kapuwaSecret0000007',
  saveUninitialized: false,
  resave: true ,
  rolling: true,
  cookie: { maxAge : 7200000 }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap')));
app.use(express.static(path.join(__dirname, 'node_modules/jquery')));
app.use(express.static(path.join(__dirname, 'node_modules/lodash')));
app.use(express.static(path.join(__dirname, 'node_modules/mousetrap')));
app.use(express.static(path.join(__dirname, 'node_modules/node-uuid')));


app.use('/', require('./routes/index') );
app.use('/data', require('./routes/data') );


// view engine setup
gaikan.options.rootDir = __dirname;
gaikan.options.layout = null;
app.set('view engine', '.html');
app.engine('html', gaikan);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

function allowCrossOriginRequests(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token, custom');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
}



console.log('kapuwa is online, you can access the ui from your browser (default port 7001, ex: http://localhost:7001/)');



module.exports = app;
