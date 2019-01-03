const StartPage = require('csp-app/components/startpage');

const initialize = function(rootElem) {
    const url = window.location.pathname.substring(1);
    
    if (url.length == 0) {
        rootElem.load(StartPage.fragment);
        // console.log(StartPage)
    }
};

document.addEventListener('DOMContentLoaded', function(evt) {
    const rootElem = new Root('#app');

    initialize(rootElem);

});

const Root = function(selector) {
    this.selector = selector;
    this.elem = document.querySelector(selector);
};

Root.prototype.load = function(elem) {
    this.elem.innerHTML = '';
    this.elem.appendChild(elem);
};

