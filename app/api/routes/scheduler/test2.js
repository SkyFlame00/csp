const {db} = require('csp-app-api/main');

const insert = `
  insert into events_participants(event_id, user_id) values($1,$2);
`;

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

const fields = 'users.id, username, first_name, last_name';
const f = 'id, event_id, username';

const sql = `
SELECT t.user_id, users.username, ${ cases.gt0 } AS any_event FROM (
  SELECT user_id, sum(t.counter) AS sum FROM (
    SELECT id as user_id, ${ cases.isNull } AS counter FROM (
      (
        SELECT users.id FROM (
          (SELECT user_2 AS id FROM friends WHERE user_1=$1)
          UNION ALL
          (SELECT user_1 AS id FROM friends WHERE user_2=$1)
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
INNER JOIN
users
ON t.user_id=users.id
`;

const today = new Date();
const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

const timeFrom = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9);
const timeTo = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);

db.query(sql, [21, today, timeFrom, timeTo]) 
  .then(res => {
    console.log('success')
    console.log(res.rows)
  })