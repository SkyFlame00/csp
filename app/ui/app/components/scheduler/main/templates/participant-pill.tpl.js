const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(participant) {
  const html = /*html*/`
    <div class="participant btn-primary" data-id="${ participant['user_id'] }">
      <div class="user-info">
        ${ participant['username'] }
      </div>
      
      <div class="btn-close-wr">
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