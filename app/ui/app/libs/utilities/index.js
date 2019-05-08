const createElementFromHTML = function(html) {
  const tempParent = document.createElement('div');
  tempParent.innerHTML = html;
  return tempParent.firstElementChild;
};

function Singleton(fn) {
  function Class() {
    if (Class.instance) {
      return Class.instance;
    }

    return Class.instance = fn();
  }

  Class.getInstance = function() {
    return Class.instance || new Class();
  };

  Class.destroy = function() {
    Class.instance = null;
  };

  return Class;
}

function range(start, end) {
  let arr = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

function sortNumbers(a, b) {
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}

function getMonthName(monthNum) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthNum];
}

function getCoords(elem) {
  var box = elem.getBoundingClientRect();

  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };
}

module.exports = {
  createElementFromHTML,
  Singleton,
  range,
  sortNumbers,
  getMonthName,
  getCoords
};