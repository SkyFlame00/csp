const {db} = require('csp-app-api/main');

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getAllMyEventsByDays(req, res) {
  let {startAt, endAt} = req.body;
  const fields = 't2.id, participants_num, title, description, date, time_from, time_to, link, type, project_id, importance';
  // const sql = `
  //   SELECT *
  //   SELECT id FROM
  //     events
  //   INNER JOIN
  //     (SELECT event_id FROM events_participants WHERE user_id=$1) as t1
  //   ON events.id=t1.event_id
  //   WHERE date BETWEEN $2 AND $3
  // `;

  const sql = `
    SELECT ${ fields } FROM
    (
      SELECT t1.event_id as event_id, COUNT(*) AS participants_num FROM
        (SELECT event_id FROM events_participants WHERE user_id=$1) as t1
      INNER JOIN
        events_participants as t2
      ON t1.event_id=t2.event_id
      GROUP BY t1.event_id
    ) AS t1
    INNER JOIN
      events AS t2
    ON t1.event_id=t2.id
    WHERE date BETWEEN $2 AND $3
  `;

  db.query(sql, [req.user.id, startAt, endAt])
    .then(result => {
      startAt = new Date(startAt);
      endAt = new Date(endAt);
      const events = result.rows;      
      const startDay = new Date(startAt.getFullYear(), startAt.getMonth(), startAt.getDate(), 0);
      const endDay = new Date(endAt.getFullYear(), endAt.getMonth(), endAt.getDate(), 0);
      const daysNumber = (endDay - startDay)/(1000*60*60*24);
      let nums = [];
      for (let i = 0; i < daysNumber; i++) nums.push(i);

      const days = nums.map(num => {
        const date = new Date(startAt.getFullYear(), startAt.getMonth(), startAt.getDate() + num, 0);
        return {
          date: date,
          dateStr: `${ date.getFullYear() }-${ date.getMonth() }-${ date.getDate() }`,
          title: `${ months[date.getMonth()] }, ${ date.getDate() }`,
          events: []
        };
      });

      events.forEach(event => {
        const dateStr = `${ event.date.getFullYear() }-${ event.date.getMonth() }-${ event.date.getDate() }`;
        const day = days.find(d=>d.dateStr===dateStr);
        day.events.push(event);
      });

      res.json( days );
    })
  ;
}

module.exports = getAllMyEventsByDays;