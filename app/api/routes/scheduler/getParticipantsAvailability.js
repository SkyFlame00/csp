const {db} = require('csp-app-api/main');

function getParticipantsAvailability(req, res) {
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

  const participantsIdsStr = req.body.participantsIds.map(p=>p['user_id']).join(', ');
  console.log('str', participantsIdsStr)

  const sql = `
    SELECT t.user_id, ${ cases.gt0 } AS busy FROM (
      SELECT user_id, sum(t.counter) AS sum FROM (
        SELECT id AS user_id, ${ cases.isNull } AS counter FROM (
          (
            SELECT id FROM users WHERE id IN (${ participantsIdsStr })
          ) AS participants
          LEFT JOIN
          (
            SELECT
              events.id AS event_id,
              events_participants.user_id AS user_id
            FROM
              (events INNER JOIN events_participants ON events.id=events_participants.event_id)
            WHERE
              events.date=$1
            AND (
              $2 BETWEEN events.time_from AND events.time_to
              OR
              $3 BETWEEN events.time_from AND events.time_to
              OR
              events.time_from BETWEEN $2 AND $3
              OR
              events.time_to BETWEEN $2 AND $3
            )
          ) AS found_users
          ON participants.id=found_users.user_id
        ) AS t
      ) AS t GROUP BY user_id
    ) AS t
    INNER JOIN users ON t.user_id=users.id
  `;

  db.query(sql, [req.body.date, req.body.timeFrom, req.body.timeTo])
    .then(result => {
      console.log(result.rows)
      res.json( result.rows );
    })
  ;
}

module.exports = getParticipantsAvailability;