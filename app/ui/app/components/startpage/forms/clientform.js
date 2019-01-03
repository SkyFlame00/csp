const { Form, FormElem } = require('csp-app/libs/forms');
const { minLength: minLengthGeneric, maxLength: maxLengthGeneric } = require('csp-app/libs/forms/utilities/validators');
const minLength = minLengthGeneric(4);
const maxLength = maxLengthGeneric(16);

const loginElem = new FormElem({
    html: `
        <div class="input-block clearfix">
            
            <input type="text" id="signup-client-login" placeholder="Login" />
        </div>
        <div class="formelem-errors"></div>`
        ,
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
            <input type="password" id="signup-client-password" placeholder="Password" />
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
            
            <input type="password" id="signup-client-passwordconf" placeholder="Confirm password" />
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

const organization = new FormElem({
    html: `
        <div class="input-block clearfix">
            
            <input type="password" id="signup-client-org" placeholder="Organization" />
        </div>
        <div class="formelem-errors"></div>`,
    input: { selector: '.input-block input', value: null },
    errors: {
        elemClass: 'formelem-errors'
    },
});

const SignupClientForm = new Form({
    name: 'signup-client',
    html: `
        <form>
            <div class="inputs"></div>
            <div class="actions">
                <input type="submit" value="Sign Up">
            </div>
        </form>
    `,
    elems: [loginElem, passwordElem, passwordConfElem, organization],
    whereToPut: '.inputs',
    submit: {
        handler: () => {},
    }
});

module.exports = SignupClientForm;