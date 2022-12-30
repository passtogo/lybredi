const Pool = require('pg').Pool;
const time = require('moment');

const pool = new Pool({
  user: process.env.USER || 'postgres',
  host: process.env.HOST || 'localhost',
  database: process.env.DATABASE || 'brainblogger',
  password: process.env.PASSWORD || 'H3B3r!',
  port: process.env.DBPORT || 5432,
});

const findfriends = (request, response) => {
  const text = request.body.text;
  const query = `select u.uuid, u.first, u.last, f.accepted from users u left join friends f on f.friend_id = u.id where (u.email like '${text}%' or u.first like '${text}%' or u.last like '${text}%') and u.uuid != '${request.body.userid}'`;
  pool.query(query, (err, results) => {
    if (err) {
      throw err;
    }
    response.writeHead(200, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*', // Allow access from other domains
    });
    response.write(JSON.stringify({ users: results.rows }));
    response.end();
  });
};

const addfriend = (data) => {
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
        'insert into friends (user_id, friend_id) values ($1, $2)',
        [user.id, friend.id],
        (err) => {
          if (err) {
            throw err;
          }
        }
      );
    });
  });
};

const getfriends = (uuid, callback) => {
  pool.query('select id from users where uuid = $1', [uuid], (err, results) => {
    if (err) {
      throw err;
    }
    const user = results.rows[0];
    pool.query(
      'select l.accepted, f.id, f.uuid, f.first, f.last, f.created_at, u.id as pid, u.uuid as puuid, u.first as pfirst, u.last as plast, u.created_at as pdate from friends l right join users f on l.friend_id = f.id left join users u on l.user_id = u.id where l.user_id = $1 or l.friend_id = $1',
      [user.id],
      (err, results) => {
        if (err) {
          throw err;
        }
        for (let i = 0; i < results.rows.length; i++) {
          results.rows[i].created_at = time(results.rows[i].created_at).format('MMM Do YY');
          results.rows[i].pdate = time(results.rows[i].pdate).format('MMM Do YY');
        }
        var friends = [];
        for (let i = 0; i < results.rows.length; i++) {
          if (results.rows[i].id != user.id) {
            friends.push({
              accepted: results.rows[i].accepted,
              uuid: results.rows[i].uuid,
              first: results.rows[i].first,
              last: results.rows[i].last,
              created_at: results.rows[i].created_at,
            });
          } else if (results.rows[i].pid != user.id) {
            friends.push({
              accepted: results.rows[i].accepted,
              uuid: results.rows[i].puuid,
              first: results.rows[i].pfirst,
              last: results.rows[i].plast,
              created_at: results.rows[i].pdate,
            });
          }
        }
        pool.query(
          'select f.uuid, f.first, f.last from friends l left join users f on l.user_id = f.id where l.friend_id = $1 and l.accepted = false',
          [user.id],
          (err, results) => {
            if (err) {
              throw err;
            }
            const requests = results.rows;
            const data = { friends: friends, requests: requests };
            callback(data);
          }
        );
      }
    );
  });
};

const acceptfriend = (data) => {
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
        'update friends set accepted = true where friend_id = $1 and user_id = $2',
        [user.id, friend.id],
        (err) => {
          if (err) {
            throw err;
          }
        }
      );
    });
  });
};

const deletefriend = (request, response) => {
  console.log(request.body.friend);
  console.log(request.body.user);

  pool.query('select id from users where uuid = $1', [request.body.user], (err, results) => {
    if (err) {
      throw err;
    }
    const user = results.rows[0];
    pool.query('select id from users where uuid = $1', [request.body.friend], (err, results) => {
      if (err) {
        throw err;
      }
      const friend = results.rows[0];
      pool.query(
        'delete from friends where (user_id = $1 and friend_id = $2) or (user_id = $2 and friend_id = $1)',
        [user.id, friend.id],
        (err) => {
          if (err) {
            throw err;
          }
        }
      );
    });
  });

  response.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*', // Allow access from other domains
  });
  response.write(JSON.stringify(''));
  response.end();
};

const getfriendsuggestions = (request, response) => {
  let query = 'select id from users where ';
  for (let i = 0; i < request.body.ids.length; i++) {
    query += `uuid = '${request.body.ids[i]}'`;
    if (request.body.ids[i + 1] != null) {
      query += ' or ';
    }
  }

  pool.query(query, (err, results) => {
    if (err) {
      throw err;
    }

    query =
      'select u1.uuid as ruuid, u1.first as rfirst, u1.last as rlast, u2.uuid as luuid, u2.first as lfirst, u2.last as llast from friends f left join users u1 on u1.id = f.user_id right join users u2 on u2.id = f.friend_id where accepted = true and (';

    for (let i = 0; i < results.rows.length; i++) {
      query += `user_id = ${results.rows[i].id} or friend_id = ${results.rows[i].id}`;
      if (results.rows[i + 1] != null) {
        query += ' or ';
      }
      if (results.rows[i + 1] == null) {
        query += ')';
      }
    }

    pool.query(query, (err, results) => {
      if (err) {
        throw err;
      }

      for (let id of request.body.ids) {
        for (let item of results.rows) {
          if (id == item.ruuid) {
            delete item.ruuid;
            delete item.rfirst;
            delete item.rlast;
          }
          if (id == item.luuid) {
            delete item.luuid;
            delete item.lfirst;
            delete item.llast;
          }
        }
      }

      var data;
      if (results.rows[0].luuid != null) {
        data = results.rows;
      } else if (results.rows[0].ruuid != null) {
        data = results.rows;
      } else {
        data = null;
      }

      response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*', // Allow access from other domains
      });
      response.write(JSON.stringify(data));
      response.end();
    });
  });
};

const getrooms = (data, callback) => {
  let friendsid = '';
  let requestsid = '';
  const rooms = [];

  if (data.friends.length > 0) {
    for (let i = 0; i < data.friends.length; i++) {
      friendsid += `userid = '${data.friends[i].uuid}'`;
      if (data.friends[i + 1] != null) {
        friendsid += ' or ';
      }
    }
  }

  if (data.requests.length > 0) {
    for (let i = 0; i < data.requests.length; i++) {
      requestsid += `userid = '${data.friends[i].uuid}'`;
      if (data.friends[i + 1] != null) {
        requestsid += ' or ';
      }
    }
  }

  if (friendsid != '') {
    pool.query(`select room from room where ${friendsid}`, (err, results) => {
      if (err) {
        throw err;
      }
      for (let room of results.rows) {
        rooms.push(room.room);
      }
      if (requestsid != '') {
        pool.query(`select room from room where ${requestsid}`, (err, results) => {
          if (err) {
            throw err;
          }
          for (let room of results.rows) {
            rooms.push(room.room);
          }
          callback(rooms);
        });
      } else {
        callback(rooms);
      }
    });
  } else if (requestsid != '') {
    pool.query(`select room from room where ${requestsid}`, (err, results) => {
      if (err) {
        throw err;
      }
      for (let room of results.rows) {
        rooms.push(room.room);
      }
    });
  }
};

module.exports = {
  findfriends,
  addfriend,
  getfriends,
  acceptfriend,
  deletefriend,
  getfriendsuggestions,
  getrooms,
};

//select u1.uuid as ruuid, u1.first as rfirst, u1.last as rlast, u2.uuid as luuid, u2.first as lfirst, u2.last as llast from friends f left join users u1 on u1.id = f.user_id right join users u2 on u2.id = f.friend_id where accepted = true and (user_id = 382 or friend_id = 382 or user_id = 1 or friend_id = 1)

//'select u.uuid, u.first, u.last from friends f right join users u on u.id = f.friend_id where (f.user_id = 1 or f.friend_id = 1) and f.accepted = true and f.friend_id != 382'
