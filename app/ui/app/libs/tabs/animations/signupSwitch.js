const signupSwitch = function() {
  function handler(evt) {

  }

  function gotoTab(tab){
    tab--;
  }

  function initialize() {
    tab--;
  }

  return {
    handler,
    gotoTab,
    initialize
  };
};

module.exports = new signupSwitch();