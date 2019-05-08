function calcWidth(timeStart, timeEnd) {
  const timeStartMinutes = new Date(
    timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(),
    timeStart.getHours(), timeStart.getMinutes()
  );
  const timeEndMinutes = new Date(
    timeEnd.getFullYear(), timeEnd.getMonth(), timeEnd.getDate(),
    timeEnd.getHours(), timeEnd.getMinutes()
  );
  const minutesDiff = (timeEndMinutes - timeStartMinutes)/(1000*60);
  return minutesDiff * this.sizes.minute;
}

module.exports = calcWidth;