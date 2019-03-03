const http = {
  location: null,
  correctUrl: function(url) {
    url = url[0] === '/' ?
      url.slice(1) :
      url;
    
    return url;
  },
  configure: function(options) {
    let location = options.location;
    location = location[location.length-1] === '/' ?
      location :
      location + '/';
    
    this.location = location;
  },
  post: function(url, body, contentType) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      url = this.correctUrl(url);
      contentType = contentType || 'application/json';

      xhr.open('POST', this.location + url);
      xhr.setRequestHeader('Content-Type', contentType);

      xhr.addEventListener('load', function() {
        resolve(this.responseText);
      });

      xhr.addEventListener('error', function() {
        reject('Network error occured');
      });

      xhr.send(JSON.stringify(body));
    });
  }
};

module.exports = http;