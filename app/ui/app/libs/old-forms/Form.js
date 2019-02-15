/*
    settings: {
        name,
        html,
        elems: [],
        whereToPut: '',
        submit
    }
*/

const Form = function(settings) {
    this.name = settings.name;
    this.html = settings.html;
    this.elems = settings.elems;
    this.fragment = this.createDOM();
    this.whereToPut = settings.whereToPut || 'form';
    this.submit = {
        selector: settings.submit.selector || 'input[type="submit"]',
        handler: settings.submit.handler || function(){}
    };

    this.insertElems();
    this.initializeEvents();
};

Form.prototype.createDOM = function() {
    const fragment = document.createDocumentFragment();
    const tmpElem = document.createElement('div');
    tmpElem.innerHTML = this.html;

    const elems = Array.prototype.slice.call(tmpElem.children);
    elems.forEach(elem => fragment.appendChild(elem));

    return fragment;
};

Form.prototype.insertElems = function() {
    const place = this.fragment.querySelector(this.whereToPut);
    Object.values(this.elems).forEach(elem => place.appendChild(elem.fragment));
};

Form.prototype.initializeEvents = function() {
    
    this.fragment.querySelector(this.submit.selector).addEventListener('click', evt => {
        evt.preventDefault();
        this.submit.handler(this.elems);
    });
};

module.exports = Form;