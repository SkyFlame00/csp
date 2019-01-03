const { Form, FormElem } = require('csp-app/libs/forms');
const { minLength: minLengthGeneric, maxLength: maxLengthGeneric } = require('csp-app/libs/forms/utilities/validators');
const minLength = minLengthGeneric(4);
const maxLength = maxLengthGeneric(16);

const loginElem = new FormElem({
    html: `
        <div class="input-block clearfix">
            
            <input type="text" id="signup-exec-login" placeholder="Login" />
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
            
            <input type="password" id="signup-exec-password" placeholder="Password" />
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

const passwordConfElem = new FormElem({
    html: `
        <div class="input-block clearfix">
            
            <input type="password" id="signup-exec-passwordconf" placeholder="Confirm password"  />
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

const SignupExecForm = new Form({
    name: 'signup-exec',
    html: `
        <form>
            <div class="inputs"></div>
            <div class="actions">
                <input type="submit" value="Sign Up">
            </div>
        </form>
    `,
    elems: {
        'login': loginElem,
        'pw': passwordElem,
        'pwConf': passwordConfElem
    },
    whereToPut: '.inputs',
    submit: {
        handler: elems => {
            console.log('hello')

            const http = new XMLHttpRequest();

            const regData = {
                login: elems['login'].value,
                passwordElem: elems['pw'].value
            };
            console.log(regData)

            http.addEventListener('load', function(evt) {
                console.log(this.responseText);
            });
            http.open('POST', '/api/getData', true);
            http.setRequestHeader('Content-Type', 'application/json');
            http.send(JSON.stringify(regData));

        },
    }
});

module.exports = SignupExecForm;