const http = require('csp-app/libs/http');
const template = require('./tpl');
const {createElementFromHTML} = require('csp-app/libs/utilities');
const {router} = require('csp-app/components/main');

const Dashboard = function() {
  return http.get('/users/getUserData')
    .then((res) => {
      const id = res.data.user.id;
      console.log(res.data)

      if (!res.success) throw new Error(res.error);

      const templateData = {
        user: res.data.user
      };

      const element = createElementFromHTML(template(templateData));
      const btn = element.querySelector('#log-out');
      btn.addEventListener('click', () => {
        window.localStorage.removeItem('auth_token');
        router.navigate('/');
      });
      const routerOutler = element.querySelector('.router-outlet');

      return {
        success: true,
        controller: {
          element: element
        },
        render: function(element) {
          routerOutler.innerHTML = '';
          routerOutler.append(element);
        }
      };
    });
};

module.exports = Dashboard;