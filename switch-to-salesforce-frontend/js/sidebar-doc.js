/**
 * Documentation sidebar: loads GET /api/sidebar, search via GET /api/search,
 * collapsible groups (details/summary), and real-time filtered views.
 */
(function () {
  var DEBOUNCE_MS = 260;
  var sidebarCache = null;
  var searchTimer = null;

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function routes() {
    return window.StsRoutes || {};
  }

  function topicHref(g, t) {
    var R = routes();
    return R.topicUrl ? R.topicUrl(g, t) : 'topic.html?group=' + encodeURIComponent(g) + '&topic=' + encodeURIComponent(t);
  }

  function articleHref(item) {
    var R = routes();
    var kind = item.kind || 'post';
    if (R.articleUrl) {
      return R.articleUrl(item.group || '', item.topic || '', item.slug, kind);
    }
    if (kind === 'page') {
      return 'page.html?slug=' + encodeURIComponent(item.slug);
    }
    return 'post.html?slug=' + encodeURIComponent(item.slug);
  }

  /** Full navigation tree from cached GET /api/sidebar */
  function renderBrowseMode(root) {
    if (!sidebarCache || !sidebarCache.length) {
      root.innerHTML =
        '<label class="sidebar__search-label sr-only" for="doc-sidebar-search">Search topics or articles</label>' +
        '<input type="search" id="doc-sidebar-search" class="sidebar__search-input" placeholder="Search topics or articles…" autocomplete="off" />' +
        '<p class="muted sidebar__empty">No sections yet. Add sidebar groups in the admin dashboard.</p>';
      bindSearchInput(root);
      return;
    }
    var html =
      '<label class="sidebar__search-label sr-only" for="doc-sidebar-search">Search topics or articles</label>' +
      '<input type="search" id="doc-sidebar-search" class="sidebar__search-input" placeholder="Search topics or articles…" autocomplete="off" />' +
      '<nav class="sidebar__doc-tree" aria-label="Documentation">';
    sidebarCache.forEach(function (group) {
      var gslug = group.slug || '';
      var topics = group.topics || [];
      var inner =
        '<ul class="sidebar__tree-nested">' +
        topics
          .map(function (t) {
            return (
              '<li><a data-nav-link class="sidebar__topic-link" href="' +
              escapeHtml(topicHref(gslug, t.slug)) +
              '">' +
              escapeHtml(t.name) +
              '</a></li>'
            );
          })
          .join('') +
        '</ul>';
      html +=
        '<details class="sidebar__subdisclosure sidebar__group">' +
        '<summary class="sidebar__subsummary">' +
        escapeHtml(group.name || 'Section') +
        '</summary>' +
        '<div class="sidebar__subpanel">' +
        inner +
        '</div></details>';
    });
    html += '</nav>';
    root.innerHTML = html;
    bindSearchInput(root);
    if (window.highlightActiveNav) window.highlightActiveNav();
    var activeLink = root.querySelector('.sidebar__topic-link.is-active');
    if (activeLink) {
      var det = activeLink.closest('details');
      if (det) det.open = true;
    }
  }

  function renderSearchSections(root, data, queryValue) {
    var groups = (data && data.groups) || [];
    var topics = (data && data.topics) || [];
    var articles = (data && data.articles) || [];
    var qVal = queryValue != null ? queryValue : root._lastQuery || '';
    var html =
      '<label class="sidebar__search-label sr-only" for="doc-sidebar-search">Search topics or articles</label>' +
      '<input type="search" id="doc-sidebar-search" class="sidebar__search-input" placeholder="Search topics or articles…" autocomplete="off" value="' +
      escapeHtml(qVal) +
      '" />' +
      '<div class="sidebar__search-results" role="region" aria-live="polite">';

    if (!groups.length && !topics.length && !articles.length) {
      html += '<p class="muted sidebar__empty">No matches.</p></div>';
      root.innerHTML = html;
      bindSearchInput(root);
      return;
    }

    if (groups.length) {
      html += '<div class="sidebar__search-section"><div class="sidebar__search-heading">Groups</div><ul class="sidebar__search-list">';
      groups.forEach(function (g) {
        html +=
          '<li><span class="sidebar__search-hit">' +
          escapeHtml(g.name) +
          '</span></li>';
      });
      html += '</ul></div>';
    }

    if (topics.length) {
      html += '<div class="sidebar__search-section"><div class="sidebar__search-heading">Topics</div><ul class="sidebar__search-list">';
      topics.forEach(function (t) {
        var href = topicHref(t.group, t.slug);
        html +=
          '<li><a data-nav-link class="sidebar__topic-link" href="' +
          escapeHtml(href) +
          '">' +
          escapeHtml(t.name) +
          '</a></li>';
      });
      html += '</ul></div>';
    }

    if (articles.length) {
      html += '<div class="sidebar__search-section"><div class="sidebar__search-heading">Articles</div><ul class="sidebar__search-list">';
      articles.forEach(function (a) {
        var href = articleHref(a);
        html +=
          '<li><a data-nav-link class="sidebar__article-link" href="' +
          escapeHtml(href) +
          '">' +
          escapeHtml(a.title) +
          '</a></li>';
      });
      html += '</ul></div>';
    }

    html += '</div>';
    root.innerHTML = html;
    bindSearchInput(root);
    var input = root.querySelector('#doc-sidebar-search');
    if (input) {
      input.focus();
      try {
        var len = input.value.length;
        input.setSelectionRange(len, len);
      } catch (e) {
        /* ignore */
      }
    }
    if (window.highlightActiveNav) window.highlightActiveNav();
  }

  function bindSearchInput(root) {
    var input = root.querySelector('#doc-sidebar-search');
    if (!input) return;
    input.addEventListener('input', function () {
      var q = input.value.trim();
      root._lastQuery = input.value;
      clearTimeout(searchTimer);
      if (!q) {
        renderBrowseMode(root);
        return;
      }
      searchTimer = setTimeout(function () {
        runSearch(root, q);
      }, DEBOUNCE_MS);
    });
  }

  function runSearch(root, q) {
    if (!window.BlogApi || !window.BlogApi.searchSite) {
      renderClientFilter(root, q);
      return;
    }
    window.BlogApi
      .searchSite(q)
      .then(function (res) {
        var data = res && res.data;
        renderSearchSections(root, data || {}, q);
      })
      .catch(function () {
        renderClientFilter(root, q);
      });
  }

  /** If /api/search fails, filter cached groups/topics by substring (case-insensitive). */
  function renderClientFilter(root, q) {
    if (!sidebarCache || !sidebarCache.length) {
      root.innerHTML =
        '<p class="muted sidebar__empty">Search unavailable. Check the API connection.</p>';
      return;
    }
    var lower = q.toLowerCase();
    var groups = [];
    var topics = [];
    sidebarCache.forEach(function (g) {
      var gslug = g.slug || '';
      var gname = (g.name || '').toLowerCase();
      var gMatch = gname.indexOf(lower) !== -1 || gslug.toLowerCase().indexOf(lower) !== -1;
      if (gMatch) {
        groups.push({ name: g.name, slug: gslug });
      }
      (g.topics || []).forEach(function (t) {
        var tn = (t.name || '').toLowerCase();
        var ts = (t.slug || '').toLowerCase();
        if (tn.indexOf(lower) !== -1 || ts.indexOf(lower) !== -1 || gMatch) {
          topics.push({ name: t.name, slug: t.slug, group: gslug });
        }
      });
    });
    renderSearchSections(root, { groups: groups, topics: topics, articles: [] }, q);
  }

  function initDocSidebar() {
    var root = document.querySelector('[data-doc-sidebar-root]');
    if (!root || !window.BlogApi || !window.BlogApi.getSidebar) return;

    root.innerHTML = '<p class="muted">Loading navigation…</p>';

    window.BlogApi
      .getSidebar()
      .then(function (res) {
        sidebarCache = (res && res.data) || [];
        renderBrowseMode(root);
      })
      .catch(function () {
        root.innerHTML =
          '<p class="muted sidebar__empty">Could not load navigation. Is the API running?</p>';
      });
  }

  window.initDocSidebar = initDocSidebar;
})();
