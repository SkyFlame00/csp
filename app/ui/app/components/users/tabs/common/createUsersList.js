const {createElementFromHTML} = require('csp-app/libs/utilities');
const userItemTemplate = require('./userItem.tpl');

function createUsersList(users) {
  return users.map(user => {
    const userAccountLink = createElementFromHTML(/*html*/`
      <a data-route="users/${user.id}">${user.username}</a>
    `);
    const userItem = userItemTemplate();
    userItem.username.appendChild(userAccountLink);
    return userItem;
  });
}

module.exports = createUsersList;