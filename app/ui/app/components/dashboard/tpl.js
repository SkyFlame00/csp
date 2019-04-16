const sidebarExec = require('./templates/sidebar_exec.tpl');
const sidebarClient = require('./templates/sidebar_client.tpl');

module.exports = data => {
  const group = data.user.group;
  let sidebar;

  if (['academic', 'student', 'ext_exec', null, undefined].includes(group)) {
    sidebar = sidebarExec;
  }

  if (group == 'client') {
    sidebar = sidebarClient;
  }

  return /*html*/`
  <div class="cmp_dashboard">
    <div class="sidebar">
      <div class="logo-block">
        <span class="logo">{ CSP }</span>
      </div>

      ${ sidebar }
    </div>
    <div class="main">
      <div class="dboard-header"><button id="log-out">Log out</button></div>
      <div class="content">
        <div class="router-outlet"></div>
      </div>
    </div>
  </div>`;
};