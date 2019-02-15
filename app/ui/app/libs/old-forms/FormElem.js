/*
    settings object has the following structure:
    settings = {
        html,
        input: {
            selector, value
        },
        validators: [
            {validator, message} ...
        ],
        errors = {
            elemClass, hidingClass
        }
    }
*/

const FormElem = function(settings) {
    this.value = settings.input.value || null;
    this.fragment = this.createDOM(settings.html);
    this.elem = this.fragment.querySelector(settings.input.selector) || null;
    this.validators = settings.validators || [];
    this.errors = {
        elem: this.fragment.querySelector('.' + settings.errors.elemClass) || null,
        hidingClass: settings.errors.hidingClass || '.none',
        messages: []
    };

    this.initializeEvents();
};

FormElem.prototype.createDOM = function(html) {
    const fragment = document.createDocumentFragment();
    const tmpElem = document.createElement('div');
    tmpElem.innerHTML = html;

    const elems = Array.prototype.slice.call(tmpElem.children);
    elems.forEach(elem => fragment.appendChild(elem))

    return fragment;
};

FormElem.prototype.initializeEvents = function() {
    this.elem.addEventListener('change', evt => {
        this.errors.messages = [];
        
        this.validators.forEach(validator => {
            if (!validator.handler(this.elem.value)) {
                this.errors.messages.push(validator.message);
            }
        });

        if (this.errors.messages.length == 0) {
            this.hideErrors();
            this.errors.elem.innerHTML = '';

            console.log (evt.target.value)
        this.value = evt.target.value;
            return;
        }
        
        this.listErrors();
        this.showErrors();
    });
};

FormElem.prototype.showErrors = function() {
    if (this.errors.elem.classList.contains(this.errors.hidingClass)) {
        this.errors.elem.classList.remove(this.errors.hidingClass);
    }
};

FormElem.prototype.hideErrors = function() {
    if (!this.errors.elem.classList.contains(this.errors.hidingClass)) {
        this.errors.elem.classList.add(this.errors.hidingClass);
    }
};

FormElem.prototype.listErrors = function() {
    const fragment = document.createDocumentFragment();
    this.errors.messages.forEach(error => {
        const li = document.createElement('li');
        li.textContent = error;
        fragment.appendChild(li);
    });
    this.errors.elem.innerHTML = '';
    this.errors.elem.appendChild(fragment);
};

module.exports = FormElem;