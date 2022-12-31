// Getting files used to start the server
const express = require('express');
const path = require('path');
const https = require('https');
//const http = require('http');
const { readFileSync } = require('fs');
const cookieSession = require('cookie-session');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const consolidate = require('consolidate');
const pg = require('pg');
const compression = require('compression');
//const dust = require('dustjs-helpers');

// postgress connection log in data
const connect = 'postgres://Ububbled:H3B3R!@localhost/ububbledata';

// Initializing the express server
const app = express();

// Compress all files
app.use(compression());

//Securing the express app using helmet
app.use(helmet());

// Setting a proxy
app.set('trust proxy', 1);

// Generate a cookie session
app.use(
  cookieSession({
    name: 'cookiesession',
    keys: ['84hwofiufho4834rfuhnortg4', 'bcw848928dych4087fhcfdd87gotwveiu'],
    httpOnly: true,
    secure: true,
  })
);

// Session middleware
app.use(express.urlencoded({ extended: false }));
app.use(
  cookieSession({
    resave: false,
    saveUninitialized: false,
    secret: 'mfnrh47dy3nd8v47fgy47ruf48fhrdfhf84836dgfjt58rfjsodri8tf8ry5ry',
    cookie: cookieSession,
    genid: function (req) {
      return genuuid(); // use UUIDs for session IDs
    },
  })
);

// Session-persistance message middleware
app.use(function (request, response, next) {
  const err = request.session.error;
  const msg = request.session.success;
  delete request.session.error;
  delete request.session.success;
  response.locals.message = '';
  if (err) response.locals.message = `<p class="msg error">${err}</p>`;
  if (msg) response.locals.message = `<p class="msg success">${msg}</p>`;
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

app.use((request, response, next) => {
  if (
    request.headers &&
    request.headers.authorization &&
    request.headers.authorization.split(' ')[0] === 'JWT'
  ) {
    jwt.verify(request.headers.authorization.split(' ')[1], 'userAPI', (err, decode) => {
      if (err) request.user = undefined;
      request.user = decode;
      next();
    });
  } else {
    request.user = undefined;
    next();
  }
});

//app.engine('dust', consolidate.dust);

//qpp.set('view engine', 'dust');
//app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.locals.siteName = process.env.SITENAME || 'Test';

//app.use(express.static(path.join(__dirname, 'public)));
app.use(express.static(path.join(__dirname, 'static')));

const sslserver = https.createServer(
  {
    key: readFileSync(path.join(__dirname, 'ssl', 'key.pem')),
    cert: readFileSync(path.join(__dirname, 'ssl', 'cert.pem')),
  },
  app
);

//const url = '192.168.1.2';
const url = 'https://127.0.0.1:3000';
const io = socketio(sslserver, {
  cors: {
    origin: `${process.env.URL}:${process.env.PORT}` || url,
    methods: ['GET', 'POST'],
  },
});
app.set('socket', io);

// Importing the routes folder to initialize the routes
const routes = require('./routes')(io);

app.use('/', routes);

// Initialize localhost in port 300 with ssl certificate;
sslserver.listen(process.env.PORT || 3000, async () => {
  console.log(`Listening secure server on port ${process.env.PORT || 3000}`);
});
