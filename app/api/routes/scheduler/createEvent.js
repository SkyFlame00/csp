const {db} = require('csp-app-api/main');
const {flat, toLocalTime} = require('csp-app-api/resources/functions');

function createEvent(req, res) {

  console.log(req.body.date);
  console.log(req.body.timeFrom);
  console.log(req.body.timeTo);

  const eventsFields = [
    req.body.title || null,
    req.body.description || null,
    (req.body.date && toLocalTime(new Date(req.body.date))) || null,
    (req.body.timeFrom && toLocalTime(new Date(req.body.timeFrom))) || null,
    (req.body.timeTo && toLocalTime(new Date(req.body.timeTo))) || null,
    req.body.link || null,
    req.body.type || null,
    req.body.project || null,
    req.body.importance || null
  ];

  const sql = `
    INSERT INTO events (title, description, date, time_from, time_to, link, type, project_id, importance) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `;
console.log(eventsFields)
  db.query(sql, eventsFields)
    .then(() => db.query('SELECT id FROM events ORDER BY id DESC LIMIT 1'))
    .then(result => {
      console.log('here')
      const eventId = result.rows[0].id;
      const pIds = req.body.participantsIds;
      let values = flat(pIds.map(p=>([eventId, p['user_id']])));
      let nums = [];
      for (let i = 0; i < pIds.length*2; i++) nums.push(i + 1);
      // const valuesStr = nums.map(n=>`$${n}`).join(', ');
      insertionsSyntaxArr = [];
      for (let i = 0; i < nums.length; i+=2) {
        insertionsSyntaxArr.push(`($${nums[i]}, $${nums[i+1]})`);
      }
      insertionsSyntaxStr = insertionsSyntaxArr.join(', ');
      console.log(values)
      console.log(insertionsSyntaxArr)
      console.log(insertionsSyntaxStr)
      db.query(`INSERT INTO events_participants (event_id, user_id) VALUES ${ insertionsSyntaxStr }`, values)
    })
    .then(() => {
      res.json({ success: true });
    })
  ;
}

module.exports = createEvent;