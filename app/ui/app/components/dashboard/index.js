const http = require('csp-app/libs/http');
const template = require('./tpl');
const {createElementFromHTML} = require('csp-app/libs/utilities');

const Dashboard = function() {
  return http.get('/users/getUserData')
    .then((res) => {
      const id = res.data.user.id;
      const element = createElementFromHTML(template({ id: id }));

      return {
        element: element
      };
    });
};

module.exports = Dashboard;