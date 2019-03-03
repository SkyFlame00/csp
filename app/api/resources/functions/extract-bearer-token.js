const extractBearerToken = function(string) {
  const regexp = /^Bearer /gi;
  const res = regexp.exec(string);
  if (regexp.lastIndex == 0) throw new Error('Bearer scheme is not correct');
  return string.substr(regexp.lastIndex);
};

module.exports = extractBearerToken;