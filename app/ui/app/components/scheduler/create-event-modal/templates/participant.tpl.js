const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(participant) {
  const html = /*html*/`
    <div class="participant">
      <div class="user-info" data-id="${ participant['user_id'] }">
        ${ participant['username'] }
      </div>
      
      <div class="close">
        <button class="btn-close"><i class="i i-close"></i></button>
      </div>
    </div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element,
    closeBtn: element.querySelector('.btn-close')
  };
}

module.exports = template;