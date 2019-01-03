const { Form, FormElem } = require('csp-app/libs/forms');
const { minLength: minLengthGeneric, maxLength: maxLengthGeneric } = require('csp-app/libs/forms/utilities/validators');
const minLength = minLengthGeneric(4);
const maxLength = maxLengthGeneric(16);

const loginElem = new FormElem({
    html: `
        <div class="input-block">
            
            <input type="text" id="login-login" placeholder="Login" />
        </div>
        <div class="formelem-errors"></div>`,
    input: { selector: '.input-block input', value: null },
    errors: {
        elemClass: 'formelem-errors'
    },
    validators: [
        {
            handler: minLength,
            message: 'The length is less than 4 chars'
        },
        {
            handler: maxLength,
            message: 'The length is more than 16 chars'
        }
    ]
});

const passwordElem = new FormElem({
    html: `
        <div class="input-block clearfix">
            
            <input type="password" id="login-password" placeholder="Password" />
        </div>
        <div class="formelem-errors"></div>`,
    input: { selector: '.input-block input', value: null },
    errors: {
        elemClass: 'formelem-errors'
    },
    validators: [
        {
            handler: minLength,
            message: 'The length is less than 4 chars'
        }
    ]
});

const LoginForm = new Form({
    name: 'login',
    html: `
        <form>
            <div class="inputs"></div>
            <div class="actions">
                <input type="submit" value="Log in">
            </div>
        </form>
    `,
    elems: {
        'login': loginElem,
        'pw': passwordElem
    }, 
    whereToPut: '.inputs',
    submit: {
        handler: elems => {
            const http = new XMLHttpRequest();

            http.addEventListener('load', function(evt) {
                console.log('we re loginning');
            });

            http.open('POST', '/api/login', true);
            http.setRequestHeader('Content-Type', 'application/json');
            http.send(JSON.stringify({login: elems.login, pw: elems.pw}));
        },
    }
});

module.exports = LoginForm;