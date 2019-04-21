module.exports = function(time) {
  const offsetMs = (new Date().getTimezoneOffset() * -1)*60*1000;
  return new Date(time.getTime() + offsetMs);
};