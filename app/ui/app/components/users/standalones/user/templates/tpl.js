const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(user) {
  const html = /*html*/`
    <div class="cmp_user-page block-shadowed">
      <div class="header">
        <div class="title"><h1>${user.first_name} ${user.last_name}</h1></div>
        <div class="additional">
          <div class="message"></div>
          <div class="btn-action-wrapper"></div>
          <div class="more-wrapper"></div>
        </div>
      </div>
      
      <div class="body">
        <div class="item">First name: ${user.first_name}</div>
        <div class="item">Second name: ${user.last_name}</div>
        <div class="item">Patronymic: ${user.patronymic}</div>
        <div class="item">Username: ${user.username}</div>
        <div class="item">Email: ${user.email}</div>
      </div>
    </div>
  `;
  const el = createElementFromHTML(html);

  return {
    root: el,
    additional: el.querySelector('.additional'),
    body: el.querySelector('.body'),
    message: el.querySelector('.message'),
    actionWrapper: el.querySelector('.btn-action-wrapper'),
    moreWrapper: el.querySelector('.more-wrapper')
  };
}

module.exports = template;