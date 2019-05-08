const http = require('csp-app/libs/http');
const template = require('./tpl');
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

      templateData.user['avatar_url'] =
        templateData.user['avatar_url'] ?
        templateData.user['avatar_url'] :
        'files/avatars/no-avatar.png';

      const tplController = template(templateData);
      tplController.userPanel.actions.logOutBtn.addEventListener('click', () => {
        window.localStorage.removeItem('auth_token');
        router.navigate('/');
      });
      tplController.userPanel.hello.root.addEventListener('click', () => {
        tplController.userPanel.actions.root.classList.toggle('no-display');
      });
      document.body.addEventListener('click', evt => {
        const isHelloBtn = evt.target.closest('.hello') === tplController.userPanel.hello.root;
        const isActionsBlock = evt.target.closest('.actions') === tplController.userPanel.actions.root;

        if (!isHelloBtn && !isActionsBlock) {
          tplController.userPanel.actions.root.classList.add('no-display');
        }
      });

      const routerOutler = tplController.root.querySelector('.router-outlet');

      return {
        success: true,
        controller: {
          element: tplController.root
        },
        render: function(element) {
          routerOutler.innerHTML = '';
          routerOutler.append(element);
        }
      };
    });
};

module.exports = Dashboard;