const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Pool = require('pg').Pool;
const time = require('moment');
const saltRounds = 10;

const pool = new Pool(
  {
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'brainblogger',
    password: process.env.PGPASSWORD || 'H3B3r!',
    port: process.env.PGPOST || 5432,
  }
);

const feedback = (data) => {
  var sql = '';
  var inputs = [];
  if (data.textinput == '') {
    sql = 'insert into feedback (first, last, happy, rating) values ($1, $2, $3, $4)';
    inputs = [data.firstname, data.lastname, data.yesorno, data.rating];
  } else if (data.textinput != '') {
    sql = 'insert into feedback (first, last, happy, description) values ($1, $2, $3, $4)';
    inputs = [data.firstname, data.lastname, data.yesorno, data.textinput];
  }
  pool.query(sql, inputs, (err, results) => {
    if (err) {
      throw err;
    }
  });
};

const contact = (data) => {
  pool.query(
    'insert into contacts (first, last, email, phone, message) values ($1, $2, $3, $4, $5)',
    [data.firstname, data.lastname, data.email, data.phone, data.textinput],
    (err, results) => {
      if (err) {
        throw err;
      }
    }
  );
};

module.exports = {
  feedback,
  contact,
};
