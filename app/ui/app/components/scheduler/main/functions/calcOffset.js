function calcOffset(timeStart) {
  const thisDay_900 = new Date(timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(), this.sizes.startHour);
  const timeStartMinutes = new Date(
    timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(),
    timeStart.getHours(), timeStart.getMinutes()
  );
  const minutesDiff = (timeStartMinutes - thisDay_900)/(1000*60);
  return minutesDiff * this.sizes.minute + this.sizes.margin;
}

module.exports = calcOffset;