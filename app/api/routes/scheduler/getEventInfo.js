const {db} = require('csp-app-api/main');

function getEventInfo(req, res) {
  const fields = `events.id AS id, title, description, date, time_from, time_to,
    category_id, link, importance, project_id, color_rgb, name as category_name`;

  const eventsDataSQL = `
    SELECT * FROM
      events
    LEFT JOIN
      categories
    ON events.category_id=categories.id
    WHERE events.id=$1
  `;

  const participantsDataSQL = `
    SELECT users.id AS user_id, username, first_name, last_name FROM
      (SELECT user_id FROM events_participants WHERE event_id=$1) AS t1
    INNER JOIN
      users
    ON t1.user_id=users.id
  `;

  Promise.all([
    db.query(eventsDataSQL, [+req.params.eventId]),
    db.query(participantsDataSQL, [+req.params.eventId])
  ])
  .then(([res1, res2]) => {
    const event = res1.rows[0];
    const participants = res2.rows.map(p => {
      console.log()
      p.you = p['user_id'] === +req.user.id;
      return p;
    });
    
    res.json({
      ...event,
      participants
    });
  });
}

module.exports = getEventInfo;