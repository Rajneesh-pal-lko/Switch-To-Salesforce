(function () {
  var TOKEN_KEY = 'sts_admin_token';

  /** Lets you test production admin without redeploying: /admin/login.html?api=https://your-api.onrender.com */
  (function applyApiOverride() {
    try {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('api');
      if (q) {
        var o = new URL(q.indexOf('://') === -1 ? 'https://' + q : q);
        window.STS_API_ORIGIN = o.origin;
        sessionStorage.setItem('sts_api_override', o.origin);
        return;
      }
      var saved = sessionStorage.getItem('sts_api_override');
      if (saved) {
        window.STS_API_ORIGIN = saved;
      }
    } catch (e) {
      /* ignore */
    }
  })();

  function apiOrigin() {
    return (
      window.STS_API_ORIGIN ||
      window.BLOG_API_ORIGIN ||
      'http://localhost:5050'
    );
  }

  function isLikelyMisconfiguredProd() {
    var h = window.location.hostname;
    var local = h === 'localhost' || h === '127.0.0.1';
    if (local) {
      return false;
    }
    var o = apiOrigin();
    return !o || o.indexOf('localhost') !== -1 || o.indexOf('127.0.0.1') !== -1;
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
    isLikelyMisconfiguredProd: isLikelyMisconfiguredProd,
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    authHeaders: authHeaders,
    api: api,
    requireAuth: requireAuth,
  };
})();
