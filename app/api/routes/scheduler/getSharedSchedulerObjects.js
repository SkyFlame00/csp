const {db} = require('csp-app-api/main');
const {toLocalTime, range, flat} = require('csp-app-api/resources/functions');

function getSharedSchedulerObjects(req, res) {
  const daysFrom = new Date(req.body.days.from);
  const daysTo = new Date(req.body.days.to);
  const timeType = req.body.time.type;
  const timeFrom = new Date(req.body.time.from);
  const timeTo = new Date(req.body.time.to);
  const timeDuration = req.body.time.duration;
  const participantsIds = req.body.participants;

  let days = [];
  const daysOffset = daysTo.getTime() - daysFrom.getTime();
  const dayMs = 1000*60*60*24;
  const daysNum = daysOffset/dayMs;

  for (let i = 0; i < daysNum + 1; i++) {
    const date = new Date(daysFrom.getTime() + dayMs * i);
    const dateLocalTime = toLocalTime(date);
    const year = dateLocalTime.getFullYear();
    const month = dateLocalTime.getMonth() + 1;
    const day = dateLocalTime.getDate();

    days.push({
      date: date,
      year: year,
      month: month,
      day: day,
      dateStr: `${year}-${month}-${day}`,
      participants: []
    });
  }

  let nums = range(1, participantsIds.length);
  let valuesStr = nums.map(n=>`$${n}`).join(', ');
  const getEventsSQL = `
    SELECT * FROM
      (
        SELECT t1.user_id, t1.event_id, users.username, users.first_name, users.last_name FROM
          (SELECT * FROM events_participants WHERE user_id IN (${valuesStr})) AS t1
        INNER JOIN
          users
        ON t1.user_id=users.id
      ) AS t1
    INNER JOIN
      events
    ON t1.event_id=events.id
    WHERE events.date >= '${ days[0].dateStr }'
    AND events.date <= '${ days[days.length - 1].dateStr }'
  `;
  let participants = [];

  db.query(`SELECT id, username, first_name, last_name FROM users WHERE id IN (${ valuesStr })`, participantsIds)
    .then(result => {
      participants = result.rows;
      return db.query(getEventsSQL, participantsIds);
    })
    .then(result => {
      //console.log(result.rows)
      result.rows.forEach(event => {
        const date = toLocalTime(new Date(event.date));
        const dateStr = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
        const day = days.find(d => d.dateStr === dateStr);
        const participant = day.participants.find(p=>p.id===event['user_id']);
        if (participant) {
          participant.events.push(event);
        }
        else {
          day.participants.push({
            id: event['user_id'],
            events: [ event ]
          });
        }
      });

      // return res.json(days)

      participants.forEach(participant => {
        days.forEach(day => {
          const pFound = day.participants.find(p => +p.id===+participant.id);
          if (!pFound) {
            day.participants.push({
              id: participant.id,
              username: participant.username,
              'first_name': participant['first_name'],
              'last_name': participant['last_name'],
              events: []
            });
          }
          else {
            pFound.username = participant.username;
            pFound['first_name'] = participant['first_name'];
            pFound['last_name'] = participant['last_name'];
          }
        });
      });

      days.forEach(day => {
        day.participants.forEach(p => {
          p.events.sort(sortByDate);
        });
      });

      // console.log('DAYS', days)
      // return res.json(days)

      const daysFreeIntervals = days.map(day => {
        const timestamp9 = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate(), 9);
        const timestamp21 = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate(), 21);

        const participants = day.participants.map(p => {
          let freeIntervals = [];

          if (p.events.length == 0) {
            freeIntervals.push({
              from: timestamp9,
              to: timestamp21
            });
          }

          for (let i = 0; i < p.events.length; i++) {
            if (i == 0) {
              let diff = p.events[i]['time_from'].getTime() - timestamp9.getTime();
              if (diff > 0) {
                freeIntervals.push({
                  from: timestamp9,
                  to: p.events[i]['time_from']
                });
              }
              if (i == p.events.length - 1) {
                let diff = timestamp21.getTime() - p.events[i]['time_to'].getTime();
                if (diff > 0) {
                  freeIntervals.push({
                    from: p.events[i]['time_to'],
                    to: timestamp21
                  });
                }
              }
            }
            else if (i == p.events.length - 1) {
              let diff = p.events[i]['time_from'].getTime() - p.events[i-1]['time_to'].getTime();
              if (diff > 0) {
                freeIntervals.push({
                  from: p.events[i-1]['time_to'],
                  to: p.events[i]['time_from']
                });
              }
              diff = timestamp21.getTime() - p.events[i]['time_to'].getTime();
              if (diff > 0) {
                freeIntervals.push({
                  from: p.events[i]['time_to'],
                  to: timestamp21
                });
              }
            }
            else {
              let diff = p.events[i]['time_from'].getTime() - p.events[i-1]['time_to'].getTime();
              if (diff > 0) {
                freeIntervals.push({
                  from: p.events[i-1]['time_to'],
                  to: p.events[i]['time_from']
                });
              }
            }
          }

          return {
            id: p.id,
            freeIntervals: freeIntervals
          };
        });

        return {
          date: day.date,
          year: day.year,
          month: day.month,
          day: day.day,
          dateStr: day.dateStr,
          participants: participants
        };
      });

      // return res.json(daysFreeIntervals)
      const daysFreeIntervalsPrepared = daysFreeIntervals.map(day => {
        return day.participants.map(p => {
          return p.freeIntervals;
        });
      });

      // console.log(daysFreeIntervals)
      // console.log(daysFreeIntervalsPrepared)

      let daysCommonFreeIntervals = [];

      for (let i = 0; i < daysFreeIntervals.length, day = daysFreeIntervals[i]; i++) {
        let commonFreeIntervals = [];
        findCommonFIs(daysFreeIntervalsPrepared[i], null, 0, commonFreeIntervals);
        daysCommonFreeIntervals.push({
          date: day.date,
          year: day.year,
          month: day.month,
          day: day.day,
          dateStr: day.dateStr,
          commonFreeIntervals: commonFreeIntervals
        });
      }

      let daysResult = [];

      for (let i = 0; i < days.length; i++) {
        daysResult.push({
          date: days[i].date,
          participants: days[i].participants,
          commonFreeIntervals: daysCommonFreeIntervals[i].commonFreeIntervals
        });
      }

      return res.json(daysResult);
    })
  ;
}

function findCommonFIs(freeIntervals, curIntersection, i, commonFreeIntervals) {
  console.log(i)
  for (let k = 0; k < freeIntervals[i].length, fi = freeIntervals[i][k]; k++) {
    const intersection = findIntersection(curIntersection, fi);
    if (!intersection) {
      const isFIOnRight = checkFIOnRight(curIntersection, fi);
      if (isFIOnRight) break;
      else continue;
    }
    if (i < freeIntervals[i].length - 1) {
      findCommonFIs(freeIntervals, intersection, i + 1, commonFreeIntervals);
    }
    else {
      commonFreeIntervals.push(intersection);
    }
  }
}

function findIntersection(ci, fi) {
  if (!ci) return fi;

  let from, to;
  const ciFromBetween = ci.from.getTime() >= fi.from.getTime() && ci.from.getTime() <= fi.to.getTime();
  const ciToBetween = ci.to.getTime() >= fi.from.getTime() && ci.to.getTime() <= fi.to.getTime();
  const fiFromBetween = fi.from.getTime() >= ci.from.getTime() && fi.from.getTime() <= ci.to.getTime();
  const fiToBetween = fi.to.getTime() >= ci.from.getTime() && fi.to.getTime() <= ci.to.getTime();

  if (ciFromBetween) from = ci.from;
  if (ciToBetween) to = ci.to;
  if (fiFromBetween) from = fi.from;
  if (fiToBetween) to = fi.to;

  return from && to ? { from, to } : null;
}

function checkFIOnRight(curIntersection, freeInterval) {
  return curIntersection && curIntersection instanceof Date
    ? freeInterval.from.getTime() >= curIntersection.to.getTime()
    : null;
}

function sortByDate(date1, date2) {
  if (date1['time_from'].getTime() < date2['time_from'].getTime()) return -1;
  if (date1['time_from'].getTime() > date2['time_from'].getTime()) return 1;
  return 0;
}

module.exports = getSharedSchedulerObjects;