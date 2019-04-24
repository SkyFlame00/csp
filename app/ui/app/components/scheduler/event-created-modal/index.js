const Modal = require('csp-app/components/modals');
const {createElementFromHTML} = require('csp-app/libs/utilities');

function ECModal() {
  const ECModalInstance = Modal.create({
    type: 'standard',
    title: 'Success',
    width: 400,
    defaultActions: false,
    actions: [{
      id: 'submit',
      type: 'primary',
      title: 'OK'
    }],
    destroyOnClose: true
  });

  const html = /*html*/`
    <p style="text-align: center">The event has been successfully created!</p>
  `;
  const element = createElementFromHTML(html);

  ECModalInstance.elements.body.appendChild(element);

  return ECModalInstance;
}

module.exports = {
  create: () => new ECModal()
};