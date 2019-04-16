const {createElementFromHTML} = require('csp-app/libs/utilities');

function blockMore() {
  const html = /*html*/`
    <div class="more">
      <button class="btn-more"><i class="i i-more"></i></button>
      <div class="more-list block-shadowed no-display">
        <ul>
          <li><button class="remove">Remove user from friends</button></li>
        </ul>
      </div>
    </div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element,
    list: element.querySelector('.more-list'),
    btnMore: element.querySelector('.btn-more'),
    btnRemove: element.querySelector('.remove')
  };
}

module.exports = blockMore;