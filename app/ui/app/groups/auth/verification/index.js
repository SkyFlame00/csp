const http = require('csp-app/libs/http');
const template = require('./tpl');

const VerificationComponent = function() {
  const queryParams = new URLSearchParams(window.location.search);
  const userId = queryParams.get('id');
  const token = queryParams.get('token');
  const tplController = template();
  let errors = [];

  if (!userId) {
    errors.push('user id');
  }

  if (!token) {
    errors.push('token');
  }

  if (errors.length > 0) {
    const message = `You did not supply ${ errors.join(' and ') }`;
    tplController.parts.infoWrapper.textContent = message;
  }

  tplController.parts.spinnerWrapper.textContent = 'Loading...';

  const httpGet = http.get('auth/verify' + window.location.search)
  const spinnerPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      tplController.parts.spinnerWrapper.innerHTML = '';
      resolve();
    }, 3000);
  });

  Promise.all([httpGet, spinnerPromise])
    .then(arr => arr[0])
    .then((res) => {
      let message;

      if (res.success) {
        message = 'Your account has been successfully verified. You will be redirected to the dashboard in 3 seconds';
      }
      else {
        switch(res.error.type) {
          case 'no_user':
            message = 'User with the specified id does not exist';
            break;
          case 'verified':
            message = 'User has already been verified';
            break;
          case 'not_found':
            message = 'No verification token was found for this username or user with the supplied username does not exist';
            break;
          case 'no_match':
            message = 'Tokens do not match';
            break;
          case 'expired':
            message = 'Token has been expired';
            const button = document.createElement('button');
            button.textContent = 'Send verification token';
            tplController.parts.sendTokenButtonWrapper.appendChild(button);
            button.addEventListener('click', () => {
              http.get(`auth/verify/send-verification-token?id=${userId}`)
                .then((res) => {
                  let message;

                  if (res.success) {
                    message = 'You have been successfully sent new verification token';
                    tplController.parts.sendTokenInfoWrapper.textContent = message;
                  }
                  else {
                    tplController.parts.sendTokenInfoWrapper.textContent = res.error.message;
                  }
                })
              ;
            });
            break;
          default:
            message = res.error.message;
            break;
        }
      }

      tplController.parts.infoWrapper.textContent = message;
    })
  ;

  return {
    element: tplController.element
  };
};


module.exports = VerificationComponent;