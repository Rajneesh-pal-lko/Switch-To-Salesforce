/**
 * Documentation sidebar: loads GET /api/sidebar, renders groups as a
 * compact coloured accordion (Track → Section links), and supports
 * full-text search via GET /api/search with client-side fallback.
 */
(function () {
  var DEBOUNCE_MS = 260;
  var sidebarCache = null;
  var searchTimer = null;

  /* ------------------------------------------------------------------
     SVG icons — one per colour index slot, matches tracks.js palette
     ------------------------------------------------------------------ */
  var ICONS = [
    /* 0 — shield (Admin) */
    '<svg width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 2.5 4v3.5C2.5 11 5 13 8 14c3-1 5.5-3 5.5-6.5V4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    /* 1 — code (Developer) */
    '<svg width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 4.5 1.5 8 5 11.5M11 4.5 14.5 8 11 11.5M9.5 3l-3 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    /* 2 — star (Fresher) */
    '<svg width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 9.8 6.4H15l-4.2 3.1 1.6 4.9L8 11.5l-4.4 2.9 1.6-4.9L1 6.4h5.2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    /* 3 — briefcase (Experienced) */
    '<svg width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="5.5" width="13" height="9" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M5.5 5.5V4A1.5 1.5 0 0 1 7 2.5h2A1.5 1.5 0 0 1 10.5 4v1.5" stroke="currentColor" stroke-width="1.6"/><path d="M1.5 9.5h13" stroke="currentColor" stroke-width="1.1"/></svg>',
    /* 4 — lightbulb */
    '<svg width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2a4 4 0 0 1 2.83 6.83V10H5.17V8.83A4 4 0 0 1 8 2ZM5.5 10.5h5M6 12.5h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    /* 5 — bar chart */
    '<svg width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 13.5h13M4 10V7M8 10V4M12 10V6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    /* 6 — layers */
    '<svg width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 14.5 5 8 8.5 1.5 5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M1.5 9.5 8 13l6.5-3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    /* 7 — target */
    '<svg width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="8" r="3.5" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="8" r="1" fill="currentColor"/></svg>',
  ];

  var CHEVRON_DOWN = '<svg width="12" height="12" fill="none" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ------------------------------------------------------------------ */

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
    return R.topicUrl
      ? R.topicUrl(g, t)
      : 'topic.html?group=' + encodeURIComponent(g) + '&topic=' + encodeURIComponent(t);
  }

  function articleHref(item) {
    var R = routes();
    var kind = item.kind || 'post';
    if (R.articleUrl) return R.articleUrl(item.group || '', item.topic || '', item.slug, kind);
    return kind === 'page'
      ? 'page.html?slug=' + encodeURIComponent(item.slug)
      : 'post.html?slug=' + encodeURIComponent(item.slug);
  }

  /* ------------------------------------------------------------------
     Browse mode — main navigation tree with new accordion style
     ------------------------------------------------------------------ */
  function renderBrowseMode(root) {
    var searchInput =
      '<label class="sidebar__search-label sr-only" for="doc-sidebar-search">Search topics or articles</label>' +
      '<input type="search" id="doc-sidebar-search" class="sidebar__search-input" placeholder="Search topics or articles…" autocomplete="off" />';

    /* Sidebar header — "Learning Tracks" label + home link */
    var navHeader =
      '<div class="snav__header">' +
        '<span class="snav__header-label">Learning Tracks</span>' +
        '<a class="snav__header-home" href="index.html" title="All tracks">↗</a>' +
      '</div>';

    if (!sidebarCache || !sidebarCache.length) {
      root.innerHTML =
        navHeader + searchInput +
        '<p class="muted sidebar__empty">No sections yet. Add sidebar groups in the admin dashboard.</p>';
      bindSearchInput(root);
      return;
    }

    var html = navHeader + searchInput + '<nav class="sidebar__doc-tree snav__tree" aria-label="Documentation">';

    sidebarCache.forEach(function (group, i) {
      var gslug = group.slug || '';
      var topics = group.topics || [];
      var ci = String(i % 8);
      var icon = ICONS[i % ICONS.length];

      var topicLinks = topics
        .map(function (t) {
          return (
            '<li>' +
              '<a data-nav-link class="sidebar__topic-link snav__topic-link" href="' +
              escapeHtml(topicHref(gslug, t.slug)) +
              '">' +
              escapeHtml(t.name) +
              '</a>' +
            '</li>'
          );
        })
        .join('');

      html +=
        '<details class="sidebar__subdisclosure sidebar__group snav__group">' +
          '<summary class="sidebar__subsummary snav__group-summary">' +
            '<span class="snav__group-icon" data-ci="' + ci + '">' + icon + '</span>' +
            '<span class="snav__group-name">' + escapeHtml(group.name || 'Section') + '</span>' +
            '<span class="snav__group-count">' + topics.length + '</span>' +
            '<span class="snav__chevron">' + CHEVRON_DOWN + '</span>' +
          '</summary>' +
          '<div class="sidebar__subpanel snav__panel">' +
            '<ul class="sidebar__tree-nested snav__topic-list">' + topicLinks + '</ul>' +
          '</div>' +
        '</details>';
    });

    html += '</nav>';
    root.innerHTML = html;
    bindSearchInput(root);
    if (window.highlightActiveNav) window.highlightActiveNav();

    /* Auto-open the group that contains the active link */
    var activeLink = root.querySelector('.snav__topic-link.is-active');
    if (activeLink) {
      var det = activeLink.closest('details');
      if (det) det.open = true;
    }
  }

  /* ------------------------------------------------------------------
     Search results mode (unchanged logic, new link classes added)
     ------------------------------------------------------------------ */
  function renderSearchSections(root, data, queryValue) {
    var groups   = (data && data.groups)   || [];
    var topics   = (data && data.topics)   || [];
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
        html += '<li><span class="sidebar__search-hit">' + escapeHtml(g.name) + '</span></li>';
      });
      html += '</ul></div>';
    }

    if (topics.length) {
      html += '<div class="sidebar__search-section"><div class="sidebar__search-heading">Topics</div><ul class="sidebar__search-list">';
      topics.forEach(function (t) {
        html +=
          '<li><a data-nav-link class="sidebar__topic-link snav__topic-link" href="' +
          escapeHtml(topicHref(t.group, t.slug)) +
          '">' + escapeHtml(t.name) + '</a></li>';
      });
      html += '</ul></div>';
    }

    if (articles.length) {
      html += '<div class="sidebar__search-section"><div class="sidebar__search-heading">Articles</div><ul class="sidebar__search-list">';
      articles.forEach(function (a) {
        html +=
          '<li><a data-nav-link class="sidebar__article-link" href="' +
          escapeHtml(articleHref(a)) +
          '">' + escapeHtml(a.title) + '</a></li>';
      });
      html += '</ul></div>';
    }

    html += '</div>';
    root.innerHTML = html;
    bindSearchInput(root);

    /* Restore cursor position */
    var input = root.querySelector('#doc-sidebar-search');
    if (input) {
      input.focus();
      try {
        var len = input.value.length;
        input.setSelectionRange(len, len);
      } catch (e) { /* ignore */ }
    }
    if (window.highlightActiveNav) window.highlightActiveNav();
  }

  /* ------------------------------------------------------------------ */

  function bindSearchInput(root) {
    var input = root.querySelector('#doc-sidebar-search');
    if (!input) return;
    input.addEventListener('input', function () {
      var q = input.value.trim();
      root._lastQuery = input.value;
      clearTimeout(searchTimer);
      if (!q) { renderBrowseMode(root); return; }
      searchTimer = setTimeout(function () { runSearch(root, q); }, DEBOUNCE_MS);
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
        renderSearchSections(root, (res && res.data) || {}, q);
      })
      .catch(function () {
        renderClientFilter(root, q);
      });
  }

  function renderClientFilter(root, q) {
    if (!sidebarCache || !sidebarCache.length) {
      root.innerHTML = '<p class="muted sidebar__empty">Search unavailable. Check the API connection.</p>';
      return;
    }
    var lower  = q.toLowerCase();
    var groups = [];
    var topics = [];
    sidebarCache.forEach(function (g) {
      var gslug  = g.slug || '';
      var gMatch = (g.name || '').toLowerCase().indexOf(lower) !== -1 ||
                   gslug.toLowerCase().indexOf(lower) !== -1;
      if (gMatch) groups.push({ name: g.name, slug: gslug });
      (g.topics || []).forEach(function (t) {
        if ((t.name || '').toLowerCase().indexOf(lower) !== -1 ||
            (t.slug || '').toLowerCase().indexOf(lower) !== -1 || gMatch) {
          topics.push({ name: t.name, slug: t.slug, group: gslug });
        }
      });
    });
    renderSearchSections(root, { groups: groups, topics: topics, articles: [] }, q);
  }

  /* ------------------------------------------------------------------ */

  /* Inject track.css if it hasn't been loaded yet (covers pages that don't
     explicitly link it — e.g. post.html, topic.html, page.html, etc.) */
  function ensureTrackCss() {
    if (document.querySelector('link[href*="track.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/track.css';
    document.head.appendChild(link);
  }

  function initDocSidebar() {
    var root = document.querySelector('[data-doc-sidebar-root]');
    if (!root || !window.BlogApi || !window.BlogApi.getSidebar) return;

    ensureTrackCss();
    root.innerHTML = '<p class="muted">Loading navigation…</p>';

    window.BlogApi
      .getSidebar()
      .then(function (res) {
        sidebarCache = (res && res.data) || [];
        renderBrowseMode(root);
      })
      .catch(function () {
        root.innerHTML = '<p class="muted sidebar__empty">Could not load navigation. Is the API running?</p>';
      });
  }

  window.initDocSidebar = initDocSidebar;
})();
