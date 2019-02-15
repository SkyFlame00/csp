const minLength = function(min) {
    return function(str) {
        return str.toString().length >= min;
    };
};

const maxLength = function(max) {
    return function(str) {
        return str.toString().length <= max;
    };
};

module.exports = {
    minLength,
    maxLength
};