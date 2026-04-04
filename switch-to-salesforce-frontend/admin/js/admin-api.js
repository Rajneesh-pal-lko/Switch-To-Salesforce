/**
 * Thin wrapper around existing backend routes (sidebar-groups, sidebar-topics, pages, posts, admin/*).
 * All authenticated calls use AdminApi.api + Bearer token from admin-core.js.
 */
(function () {
  var A = window.AdminApi;
  if (!A) return;

  function json(path, opts) {
    return A.api(path, opts || {});
  }

  function authJson(path, opts) {
    opts = opts || {};
    opts.headers = A.authHeaders(opts.body instanceof FormData ? false : true);
    return A.api(path, opts);
  }

  window.AdminData = {
    /** GET /api/admin/stats */
    getStats: function () {
      return authJson('/api/admin/stats');
    },

    /** GET /api/sidebar-groups */
    listGroups: function () {
      return json('/api/sidebar-groups').then(function (r) {
        return r.data || [];
      });
    },

    /** GET /api/sidebar-groups/tree */
    getGroupTree: function () {
      return json('/api/sidebar-groups/tree').then(function (r) {
        return r.data || [];
      });
    },

    createGroup: function (payload) {
      return authJson('/api/sidebar-groups', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    updateGroup: function (id, payload) {
      return authJson('/api/sidebar-groups/' + encodeURIComponent(id), {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    deleteGroup: function (id) {
      return authJson('/api/sidebar-groups/' + encodeURIComponent(id), { method: 'DELETE' });
    },

    /** GET /api/sidebar-topics?groupId= */
    listTopics: function (groupId) {
      var q = groupId ? '?groupId=' + encodeURIComponent(groupId) : '';
      return json('/api/sidebar-topics' + q).then(function (r) {
        return r.data || [];
      });
    },

    createTopic: function (payload) {
      return authJson('/api/sidebar-topics', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    updateTopic: function (id, payload) {
      return authJson('/api/sidebar-topics/' + encodeURIComponent(id), {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    deleteTopic: function (id) {
      return authJson('/api/sidebar-topics/' + encodeURIComponent(id), { method: 'DELETE' });
    },

    /** GET /api/admin/pages — all PageContent (draft + published) */
    listArticles: function () {
      return authJson('/api/admin/pages');
    },

    getArticleById: function (id) {
      return authJson('/api/admin/pages/' + encodeURIComponent(id));
    },

    createArticle: function (payload) {
      return authJson('/api/pages', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    updateArticle: function (id, payload) {
      return authJson('/api/pages/' + encodeURIComponent(id), {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    deleteArticle: function (id) {
      return authJson('/api/pages/' + encodeURIComponent(id), { method: 'DELETE' });
    },

    /** Blog posts (separate from documentation articles) */
    listPosts: function (params) {
      var q = new URLSearchParams();
      if (params && params.limit) q.set('limit', params.limit);
      var qs = q.toString();
      return authJson('/api/admin/posts' + (qs ? '?' + qs : ''));
    },

    getPostBySlug: function (slug) {
      return authJson('/api/admin/posts/' + encodeURIComponent(slug));
    },

    listCategories: function () {
      return json('/api/categories').then(function (r) {
        return r.data || [];
      });
    },

    /** GET /api/admin/media — recent uploads for image picker */
    listMedia: function () {
      return authJson('/api/admin/media').then(function (r) {
        return r.data || [];
      });
    },

    /** POST /api/admin/media — FormData with field name `file` */
    uploadMedia: function (formData) {
      return fetch(A.apiOrigin() + '/api/admin/media', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + A.getToken() },
        body: formData,
      }).then(function (res) {
        return res.json().then(function (body) {
          if (!res.ok) {
            var err = new Error(body.message || res.statusText);
            err.status = res.status;
            throw err;
          }
          return body;
        });
      });
    },
  };
})();
