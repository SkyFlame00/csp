const {db} = require('csp-app-api/main');

function getAllFriendsBasedOnAvailability(req, res) {
  const date = new Date(req.body.date);
  const timeFrom = new Date(req.body.timeFrom);
  const timeTo = new Date(req.body.timeTo);

  const cases = {
    isNull: `
      case
        when event_id is null
        then 0
        else 1
      end
    `,
    gt0: `
      case
        when sum > 0
        then true
        else false
      end
    `
  };

  const fields = 'users.username, users.first_name, users.last_name';

  const sql = `
    SELECT t.user_id, ${ fields }, ${ cases.gt0 } AS busy FROM (
      SELECT user_id, sum(t.counter) AS sum FROM (
        SELECT id AS user_id, ${ cases.isNull } AS counter FROM (
          (
            SELECT users.id FROM (
              (SELECT user_2 AS id FROM friends WHERE user_1=$1)
              UNION ALL
              (SELECT user_1 AS id FROM friends WHERE user_2=$1)
              UNION ALL
              (SELECT id FROM users WHERE id=$1)
            ) AS friends_ids
            INNER JOIN
            users
            ON friends_ids.id=users.id
          ) AS friends
          LEFT JOIN
          (
            SELECT
              events.id AS event_id,
              events_participants.user_id AS user_id
            FROM
              (events INNER JOIN events_participants ON events.id=events_participants.event_id)
            WHERE
              events.date=$2
            AND (
              $3 BETWEEN events.time_from AND events.time_to
              OR
              $4 BETWEEN events.time_from AND events.time_to
              OR
              events.time_from BETWEEN $3 AND $4
              OR
              events.time_to BETWEEN $3 AND $4
            )
          ) AS found_users
          ON friends.id=found_users.user_id
        ) AS t
      ) AS t GROUP BY user_id
    ) AS t
    INNER JOIN users ON t.user_id=users.id
  `;

  // db.query(sql, [req.user.id, req.body.date, req.body.timeFrom, req.body.timeTo])
  db.query(sql, [req.user.id, date, timeFrom, timeTo])
    .then(result => {
      const participants = result.rows.map(p => {
        p.you = p['user_id'] === req.user.id;
        return p;
      });

      res.json( participants );
    })
  ;
}

module.exports = getAllFriendsBasedOnAvailability;