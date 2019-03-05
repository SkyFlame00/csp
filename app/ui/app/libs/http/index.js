function configure(options) {
  let location = options.location;
  location = location[location.length-1] === '/' ?
    location :
    location + '/';
  
  this.location = location;
}

function getCorrectUrl(url) {
  url = url[0] === '/' ?
    url.slice(1) :
    url;

  return url;
}

function setAuthorizationHeader(xhr) {
  const token = window.localStorage.getItem('auth_token');

  if (token) {
    xhr.setRequestHeader('authorization', `Bearer ${token}`);
  }
}

function get(url, options) {
  return this.makeRequest('GET', url, null, options);
}

function post(url, body, options) {
  return this.makeRequest('POST', url, body, options);
}

function makeRequest(method, url, body, options) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    url = this.getCorrectUrl(url);

    xhr.open(method, this.location + url);

    if (method == 'POST') {
      xhr.setRequestHeader(
        'Content-Type',
        (options && options.contentType) || this.contentTypes.json
      );
    }

    this.setAuthorizationHeader(xhr);

    xhr.addEventListener('load', () => {
      const isJson = xhr.getResponseHeader('Content-Type').match(this.contentTypes.json);
      const response = isJson ?
        JSON.parse(xhr.responseText) :
        xhr.responseText;

      resolve(response);
    });

    xhr.addEventListener('error', function() {
      reject('Network error occured');
    });

    if (method == 'GET') {
      xhr.send();
      return;
    }

    if (method == 'POST') {
      xhr.send(JSON.stringify(body));
      return;
    }
  });
}

module.exports = {
  location: null,
  getCorrectUrl: getCorrectUrl,
  configure: configure,
  setAuthorizationHeader: setAuthorizationHeader,
  contentTypes: {
    json: 'application/json'
  },
  makeRequest: makeRequest,
  get: get,
  post: post
};