function descend(arr, depth, flattenArr=[]) {
  arr.forEach(item => {
    if (item instanceof Array && depth > 0) {
      descend(item, depth - 1, flattenArr);
    }
    else {
      flattenArr.push(item);
    }
  });
  return flattenArr;
}

module.exports = function(arr, depth=1) {
  return descend(arr, depth);
};