const http = require('csp-app/libs/http');
const {mainTemplate, blockMoreTemplate} = require('./templates');
const {createElementFromHTML} = require('csp-app/libs/utilities');

const friendsMsg = 'You are friends';
const friendReqSentMsg = 'You have sent a request to become a friend';

function insertSendFriendReqBtn(options) {
  const tplController = options.tplController;
  const userId = options.userId;

  const sendFriendReqBtn = createElementFromHTML(/*html*/`
    <button class="btn-primary">Add to friends</button>
  `);

  sendFriendReqBtn.addEventListener('click', () => {
    http.get(`users/send-friend-req/${userId}`)
      .then(res => {
        if (res.answer) {
          tplController.additional.innerHTML = friendReqSentMsg;
        }
      })
    ;
  });

  tplController.actionWrapper.appendChild(sendFriendReqBtn);
}

function insertBlockMore(options) {
  const tplController = options.tplController;
  const userId = options.userId;
  BMTplController = blockMoreTemplate();
          
  BMTplController.btnMore.addEventListener('click', () => {
    BMTplController.list.classList.toggle('no-display');
  });

  document.body.addEventListener('click', evt => {
    const isMoreBtn = evt.target.closest('.btn-more') === BMTplController.btnMore;
    const isMoreBlock = evt.target.closest('.more-list') === BMTplController.list;

    if (!isMoreBtn && !isMoreBlock) {
      BMTplController.list.classList.add('no-display');
    }
  });

  BMTplController.btnRemove.addEventListener('click', () => {
    http.get(`users/remove-from-friends/${userId}`)
      .then(res => {
        if (res.answer) {
          tplController.message.innerHTML = '';
          tplController.moreWrapper.innerHTML = '';
          insertSendFriendReqBtn({ tplController, userId });
        }
      })
    ;
  });

  tplController.moreWrapper.appendChild(BMTplController.root);
}

function UserPageComponent(userId) {
  return function() {
    return http.get(`users/getUserBase/${userId}`)
      .then(user => {
        if (Object.keys(user).length === 0) {
          return {
            success: false,
            error: 'User with the supplied id has not been found'
          };
        }

        return Promise.all([
          user,
          http.get(`users/me-friend-with/${userId}`),
          http.get(`users/me-sent-friend-req/${userId}`)
        ]);
      })
      .then(([user, isFriendObj, friendReq]) => {
        const tplController = mainTemplate(user);
        
        if (isFriendObj.answer) {
          tplController.message.textContent = friendsMsg;
          insertBlockMore({ tplController, userId });
        }
        else if (friendReq.requested && friendReq.amRequester) {
          tplController.message.textContent = friendReqSentMsg;
        }
        else if (friendReq.requested && !friendReq.amRequester) {
          const confirmFriendReqBtn = createElementFromHTML(/*html*/`
            <button class="btn-primary">Confirm you are friends</button>
          `);

          confirmFriendReqBtn.addEventListener('click', () => {
            http.get(`users/confirm-friend-req/${userId}`)
              .then(res => {
                if (res.answer) {
                  tplController.actionWrapper.innerHTML = '';
                  tplController.message.textContent = friendsMsg;
                  insertBlockMore({ tplController, userId });
                }
              })
            ;
          });

          tplController.actionWrapper.appendChild(confirmFriendReqBtn);
        }
        else {
          insertSendFriendReqBtn({ tplController, userId });
        }
        
        return {
          success: true,
          controller: {
            element: tplController.root
          }
        };
      })
    ;
  };
}

module.exports = UserPageComponent;