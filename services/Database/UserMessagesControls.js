const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Pool = require('pg').Pool;
const time = require('moment');

const saltRounds = 10;

const pool = new Pool({
  user: process.env.USER || 'postgres',
  host: process.env.HOST || 'localhost',
  database: process.env.DATABASE || 'brainblogger',
  password: process.env.PASSWORD || 'H3B3r!',
  port: process.env.DBPORT || 5432,
});

const createmsg = (data, callback) => {
  pool.query('select id from users where uuid = $1', [data.user], (err, results) => {
    if (err) {
      throw err;
    }
    const user = results.rows[0];
    pool.query('select id from users where uuid = $1', [data.friend], (err, results) => {
      if (err) {
        throw err;
      }
      const friend = results.rows[0];
      pool.query(
        'insert into messages (sender, receiver, body) values ($1, $2, $3)',
        [user.id, friend.id, data.msg],
        (err) => {
          if (err) {
            throw err;
          }
          pool.query('select id from messages order by created_at desc limit 1', (err, results) => {
            if (err) {
              throw err;
            }
            callback(results.rows[0].id);
          });
        }
      );
    });
  });
};

const getmsg = (data, callback) => {
  pool.query('select id from users where uuid = $1', [data.user], (err, results) => {
    if (err) {
      throw err;
    }
    const user = results.rows[0];
    pool.query('select id from users where uuid = $1', [data.friend], (err, results) => {
      if (err) {
        throw err;
      }
      const friend = results.rows[0];
      pool.query(
        'select s.uuid, s.first, s.last, m.id, m.body, m.created_at as date, exists(select 1 from likemsg l where l.msg_id = m.id and l.user_id = $1 limit 1) as liked, exists(select 1 from likemsg l where l.msg_id = m.id and l.user_id = $2 limit 1) as friendlike from messages m left join users s on m.sender = s.id where sender = $1 and receiver = $2 or sender = $2 and receiver = $1 order by m.created_at asc',
        [user.id, friend.id],
        (err, results) => {
          if (err) {
            throw err;
          }
          for (let msg of results.rows) {
            msg.date = time(msg.date).fromNow();
          }
          callback(results.rows);
        }
      );
    });
  });
};

const likemsg = (data) => {
  pool.query('select id from users where uuid = $1', [data.user], (err, results) => {
    if (err) {
      throw err;
    }
    if (data.type == 'Like') {
      pool.query(
        'insert into likemsg (msg_id, user_id) values ($1, $2)',
        [data.msgid, results.rows[0].id],
        (err) => {
          if (err) {
            throw err;
          }
        }
      );
    } else {
      pool.query(
        'delete from likemsg where msg_id = $1 and user_id = $2',
        [data.msgid, results.rows[0].id],
        (err) => {
          if (err) {
            throw err;
          }
        }
      );
    }
  });
};

module.exports = {
  createmsg,
  getmsg,
  likemsg,
};
