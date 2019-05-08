const sidebarExec = require('./templates/sidebar_exec.tpl');
const sidebarClient = require('./templates/sidebar_client.tpl');
const {createElementFromHTML} = require('csp-app/libs/utilities');

module.exports = data => {
  const group = data.user.group;
  let groups = ['academic', 'student', 'ext_exec', null, undefined];
  let sidebar;

  if (groups.includes(group)) {
    sidebar = sidebarExec;
  }

  if (group == 'client') {
    sidebar = sidebarClient;
  }

  const html = /*html*/`
    <div class="cmp_dashboard">
      <div class="sidebar">
        <div class="logo-block">
          <a class="logo" data-route="/">{ CSP }</a>
        </div>

        ${ sidebar }
      </div>
      <div class="main">
        <div class="dboard-header">
          <div class="user-panel">
            <div class="hello">
              <div class="avatar-wrapper">
                <img src="${ data.user['avatar_url'] }" />
              </div>

              <div class="username-wrapper">
                <span>${ data.user.username }</span>
              </div>

              <div class="more-wrapper">
                <i class="i i-sort"></i>
              </div>
            </div>

            <div class="actions block-shadowed no-display">
              <ul>
                <li><a class="profile" data-route="my-profile">My profile</a></li>
                <li><button class="log-out">Log out</button></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="content">
          <div class="router-outlet"></div>
        </div>
      </div>
    </div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element,
    routerOutlet: element.querySelector('.router-outlet'),
    userPanel: {
      hello: {
        root: element.querySelector('.user-panel .hello')
      },
      actions: {
        root: element.querySelector('.user-panel .actions'),
        myProfileBtn: element.querySelector('.user-panel .actions .profile'),
        logOutBtn: element.querySelector('.user-panel .actions .log-out')
      }
    }
  };
};