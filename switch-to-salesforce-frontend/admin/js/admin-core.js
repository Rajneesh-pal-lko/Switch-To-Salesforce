(function () {
  var TOKEN_KEY = 'sts_admin_token';

  function apiOrigin() {
    return window.STS_API_ORIGIN || window.BLOG_API_ORIGIN || 'http://localhost:5050';
  }

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  function setToken(t) {
    sessionStorage.setItem(TOKEN_KEY, t);
  }

  function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  function authHeaders(json) {
    var h = { Authorization: 'Bearer ' + getToken() };
    if (json !== false) {
      h['Content-Type'] = 'application/json';
    }
    return h;
  }

  function api(path, options) {
    options = options || {};
    var url = apiOrigin() + path;
    return fetch(url, options).then(function (res) {
      if (res.status === 401) {
        clearToken();
        window.location.href = 'login.html';
        return Promise.reject(new Error('Unauthorized'));
      }
      if (!res.ok) {
        return res.text().then(function (text) {
          var body = {};
          try {
            body = text ? JSON.parse(text) : {};
          } catch (e) {
            body = { message: text || res.statusText };
          }
          var err = new Error(body.message || res.statusText || 'Request failed');
          err.status = res.status;
          err.body = body;
          throw err;
        });
      }
      var ct = res.headers.get('content-type');
      if (ct && ct.indexOf('application/json') !== -1) {
        return res.json();
      }
      return res.text();
    });
  }

  function requireAuth() {
    if (!getToken()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  window.AdminApi = {
    apiOrigin: apiOrigin,
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    authHeaders: authHeaders,
    api: api,
    requireAuth: requireAuth,
  };
})();
