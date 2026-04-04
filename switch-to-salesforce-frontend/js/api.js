(function () {
  var API_ORIGIN = window.BLOG_API_ORIGIN || window.STS_API_ORIGIN || 'http://localhost:5050';
  var API_BASE = API_ORIGIN + '/api';

  function json(res) {
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
    return res.json();
  }

  window.BlogApi = {
    API_ORIGIN: API_ORIGIN,
    API_BASE: API_BASE,

    getPosts: function (params) {
      var q = new URLSearchParams();
      if (params && params.page) q.set('page', params.page);
      if (params && params.limit) q.set('limit', params.limit);
      if (params && params.category) q.set('category', params.category);
      if (params && params.topicSlug) q.set('topicSlug', params.topicSlug);
      if (params && params.q) q.set('q', params.q);
      var url = API_BASE + '/posts' + (q.toString() ? '?' + q.toString() : '');
      return fetch(url).then(json);
    },

    getPost: function (slug) {
      return fetch(API_BASE + '/posts/' + encodeURIComponent(slug)).then(json);
    },

    getCategories: function () {
      return fetch(API_BASE + '/categories').then(json);
    },

    postComment: function (payload) {
      return fetch(API_BASE + '/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(json);
    },

    subscribe: function (email) {
      return fetch(API_BASE + '/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      }).then(json);
    },

    getSidebarTree: function () {
      return fetch(API_ORIGIN + '/api/sidebar-groups/tree').then(json);
    },

    getCmsPageBySlug: function (slug) {
      return fetch(API_BASE + '/pages/' + encodeURIComponent(slug)).then(json);
    },

    /** Doc site: group → topic tree for the sidebar */
    getSidebar: function () {
      return fetch(API_BASE + '/sidebar').then(json);
    },

    /** Doc site: filter groups, topics, and articles (sidebar search) */
    searchSite: function (q) {
      var qs = new URLSearchParams();
      qs.set('q', q || '');
      return fetch(API_BASE + '/search?' + qs.toString()).then(json);
    },

    listCmsPages: function (params) {
      var qs = new URLSearchParams();
      if (params && params.topicSlug) qs.set('topicSlug', params.topicSlug);
      return fetch(API_BASE + '/pages' + (qs.toString() ? '?' + qs.toString() : '')).then(json);
    },
  };
})();
