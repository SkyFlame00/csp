const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(data) {
  const html = /*html*/`
    <div class="cmp_verif">
      <div class="spinner-wr"></div>
      <div class="info-wr"></div>
      <div class="sendtoken-wr">
        <div class="sendtoken-info"></div>
        <div class="sendtoken-button-wr"></div>
      </div>
    </div>
  `;

  const element = createElementFromHTML(html);

  return {
    element: element,
    parts: {
      spinnerWrapper: element.querySelector('.spinner-wr'),
      infoWrapper: element.querySelector('.info-wr'),
      sendTokenInfoWrapper: element.querySelector('.sendtoken-info'),
      sendTokenButtonWrapper: element.querySelector('.sendtoken-button-wr')
    }
  };
}

module.exports = template;