const {createElementFromHTML} = require('csp-app/libs/utilities');

function userItemTemplate() {
  const html = /*html*/`
    <div class="user-item">
      <div class="avatar"></div>
      <div class="username"></div>
    </div>
  `;
  const el = createElementFromHTML(html);

  return {
    root: el,
    avatar: el.querySelector('.avatar'),
    username: el.querySelector('.username')
  };
}

module.exports = userItemTemplate;