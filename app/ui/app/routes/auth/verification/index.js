const {render} = require('csp-app/components/main');
const VerificationComponent = require('csp-app/groups/auth/verification');

function verification() {
  render([new VerificationComponent()]);
}

module.exports = verification;