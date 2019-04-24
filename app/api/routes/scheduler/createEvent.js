const {db} = require('csp-app-api/main');
const {flat, toLocalTime} = require('csp-app-api/resources/functions');

function createEvent(req, res) {
  const eventsFields = [
    req.body.title || null,
    req.body.description || null,
    (req.body.date && (new Date(req.body.date))) || null,
    (req.body.timeFrom && (new Date(req.body.timeFrom))) || null,
    (req.body.timeTo && (new Date(req.body.timeTo))) || null,
    req.body.link || null,
    req.body.type || null,
    req.body.project || null,
    req.body.importance || null
  ];

  const sql = `
    INSERT INTO events (title, description, date, time_from, time_to, link, category_id, project_id, importance) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `;
  
  db.query(sql, eventsFields)
    .then(() => db.query('SELECT id FROM events ORDER BY id DESC LIMIT 1'))
    .then(result => {
      const eventId = result.rows[0].id;
      const pIds = req.body.participantsIds;
      let values = flat(pIds.map(p=>([eventId, p['user_id']])));
      let nums = [];
      let insertionsSyntaxArr = [];

      for (let i = 0; i < pIds.length*2; i++) nums.push(i + 1);
      for (let i = 0; i < nums.length; i+=2) insertionsSyntaxArr.push(`($${nums[i]}, $${nums[i+1]})`);

      insertionsSyntaxStr = insertionsSyntaxArr.join(', ');

      db.query(`INSERT INTO events_participants (event_id, user_id) VALUES ${ insertionsSyntaxStr }`, values)
    })
    .then(() => db.query('SELECT id FROM events ORDER BY id DESC LIMIT 1'))
    .then(result => {
      res.json({
        success: true,
        data: {
          eventId: result.rows[0].id
        }
      });
    })
  ;
}

module.exports = createEvent;