/**
 * sidebar-doc.js — 3-level SPA sidebar navigator.
 *
 * Level 0  All tracks (groups) as clickable rows
 * Level 1  Selected track: back button + topic accordion.
 *          Each topic expands inline to show numbered article links.
 *          Clicking an article triggers window.StsApp.navigate() —
 *          the article renders in the main panel without a page reload.
 *
 * Exposes window.StsNav.syncRoute(route) so app.js can sync the sidebar
 * state when the user uses browser back/forward.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* State                                                                */
  /* ------------------------------------------------------------------ */

  var _data          = [];   /* [{slug, name, topics:[{slug,name}]}]     */
  var _level         = 0;   /* 0 = group list, 1 = topic accordion       */
  var _groupIdx      = -1;  /* index in _data for selected group         */
  var _openTopicIdx  = -1;  /* which topic accordion is open             */
  var _topicCache    = {};  /* topicSlug → [{slug,title,kind,excerpt}]   */
  var _root          = null;/* [data-doc-sidebar-root]                   */
  var _searchTimer   = null;

  /* ------------------------------------------------------------------ */
  /* Icons & colours (matches tracks.js palette)                         */
  /* ------------------------------------------------------------------ */

  var ICONS = [
    '<svg width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 2.5 4v3.5C2.5 11 5 13 8 14c3-1 5.5-3 5.5-6.5V4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    '<svg width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 4.5 1.5 8 5 11.5M11 4.5 14.5 8 11 11.5M9.5 3l-3 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '<svg width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 9.8 6.4H15l-4.2 3.1 1.6 4.9L8 11.5l-4.4 2.9 1.6-4.9L1 6.4h5.2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    '<svg width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="5.5" width="13" height="9" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M5.5 5.5V4A1.5 1.5 0 0 1 7 2.5h2A1.5 1.5 0 0 1 10.5 4v1.5" stroke="currentColor" stroke-width="1.6"/><path d="M1.5 9.5h13" stroke="currentColor" stroke-width="1.1"/></svg>',
    '<svg width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2a4 4 0 0 1 2.83 6.83V10H5.17V8.83A4 4 0 0 1 8 2ZM5.5 10.5h5M6 12.5h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    '<svg width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 13.5h13M4 10V7M8 10V4M12 10V6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    '<svg width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 14.5 5 8 8.5 1.5 5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M1.5 9.5 8 13l6.5-3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    '<svg width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="8" r="3.5" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="8" r="1" fill="currentColor"/></svg>',
  ];

  var CHEVRON_RIGHT = '<svg width="11" height="11" fill="none" viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2.5 8 6l-4 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHEVRON_DOWN  = '<svg width="11" height="11" fill="none" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var BACK_ARROW    = '<svg width="12" height="12" fill="none" viewBox="0 0 14 14" aria-hidden="true"><path d="M9 2.5 4 7l5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ------------------------------------------------------------------ */
  /* Utilities                                                            */
  /* ------------------------------------------------------------------ */

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function ensureTrackCss() {
    if (document.querySelector('link[href*="track.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = 'css/track.css';
    document.head.appendChild(link);
  }

  /* ------------------------------------------------------------------ */
  /* Render — Level 0: all groups                                        */
  /* ------------------------------------------------------------------ */

  function renderLevel0() {
    _level = 0; _groupIdx = -1; _openTopicIdx = -1;
    if (!_root) return;

    var html =
      '<div class="snav__l0-header">' +
        '<span class="snav__l0-label">All Guides</span>' +
      '</div>' +
      '<div class="snav__search-wrap">' +
        '<label class="sr-only" for="snav-search">Search topics or articles</label>' +
        '<input type="search" id="snav-search" class="sidebar__search-input snav__search" ' +
          'placeholder="Search topics or articles…" autocomplete="off" />' +
      '</div>' +
      '<div class="snav__group-list" role="list">';

    _data.forEach(function (group, i) {
      var ci = String(i % 8);
      html +=
        '<button class="snav__group-row" role="listitem" data-gi="' + i + '" type="button">' +
          '<span class="snav__group-icon" data-ci="' + ci + '">' + ICONS[i % ICONS.length] + '</span>' +
          '<span class="snav__group-name">' + escapeHtml(group.name) + '</span>' +
          '<span class="snav__group-count">' + (group.topics || []).length + '</span>' +
          '<span class="snav__group-arrow">' + CHEVRON_RIGHT + '</span>' +
        '</button>';
    });

    html += '</div>';
    _root.innerHTML = html;
    _bindLevel0();
    _bindSearch();
  }

  function _bindLevel0() {
    _root.querySelectorAll('.snav__group-row').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var gi = parseInt(btn.getAttribute('data-gi'), 10);
        gotoLevel1(gi);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Render — Level 1: selected group + topic accordion                  */
  /* ------------------------------------------------------------------ */

  function gotoLevel1(groupIdx) {
    _level    = 1;
    _groupIdx = groupIdx;
    _openTopicIdx = -1;
    renderLevel1();
    /* Update hash to reflect group selection */
    if (window.StsApp) {
      window.StsApp.navigate({
        groupSlug: _data[groupIdx].slug,
        topicSlug: '', articleSlug: '', kind: '',
      });
    }
  }

  function renderLevel1() {
    if (!_root || _groupIdx < 0) return;
    var group  = _data[_groupIdx];
    var topics = group.topics || [];
    var ci     = String(_groupIdx % 8);

    var html =
      /* Back header */
      '<div class="snav__l1-header">' +
        '<button class="snav__back-btn" type="button">' +
          BACK_ARROW + ' All Guides' +
        '</button>' +
        '<div class="snav__l1-title">' +
          '<span class="snav__group-icon snav__group-icon--sm" data-ci="' + ci + '">' +
            ICONS[_groupIdx % ICONS.length] +
          '</span>' +
          '<span class="snav__l1-name">' + escapeHtml(group.name) + '</span>' +
        '</div>' +
      '</div>' +
      /* Topic list */
      '<div class="snav__topic-list" id="snav-topic-list">';

    topics.forEach(function (topic, ti) {
      var isOpen = ti === _openTopicIdx;
      html += _renderTopicItem(topic, ti, isOpen);
    });

    html += '</div>';
    _root.innerHTML = html;
    _bindLevel1();

    /* Load articles for the open topic */
    if (_openTopicIdx >= 0 && topics[_openTopicIdx]) {
      _loadTopicArticles(topics[_openTopicIdx], _openTopicIdx);
    }
  }

  function _renderTopicItem(topic, ti, isOpen) {
    return (
      '<div class="snav__topic-item' + (isOpen ? ' snav__topic-item--open' : '') + '" data-ti="' + ti + '">' +
        '<button class="snav__topic-header" type="button" aria-expanded="' + (isOpen ? 'true' : 'false') + '">' +
          '<span class="snav__topic-name">' + escapeHtml(topic.name) + '</span>' +
          '<span class="snav__topic-chevron">' + (isOpen ? CHEVRON_DOWN : CHEVRON_RIGHT) + '</span>' +
        '</button>' +
        '<div class="snav__article-list" id="snav-articles-' + ti + '"' + (isOpen ? '' : ' hidden') + '>' +
          '<p class="snav__article-loading muted">Loading…</p>' +
        '</div>' +
      '</div>'
    );
  }

  function _bindLevel1() {
    /* Back button */
    var backBtn = _root.querySelector('.snav__back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        renderLevel0();
        if (window.StsApp) window.StsApp.navigate({ groupSlug: '', topicSlug: '', articleSlug: '', kind: '' });
      });
    }

    /* Topic headers */
    _root.querySelectorAll('.snav__topic-header').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('[data-ti]');
        var ti   = parseInt(item.getAttribute('data-ti'), 10);
        _toggleTopic(ti);
      });
    });
  }

  function _toggleTopic(ti) {
    if (_groupIdx < 0) return;
    var topics = _data[_groupIdx].topics || [];

    /* Close previously open topic (if different) */
    if (_openTopicIdx !== -1 && _openTopicIdx !== ti) {
      _setTopicOpen(_openTopicIdx, false);
    }

    var isNowOpen = (_openTopicIdx !== ti);
    _openTopicIdx = isNowOpen ? ti : -1;
    _setTopicOpen(ti, isNowOpen);

    if (isNowOpen && topics[ti]) {
      _loadTopicArticles(topics[ti], ti);
    }

    /* Update URL hash to group/topic (no article) */
    if (window.StsApp) {
      window.StsApp.navigate({
        groupSlug: _data[_groupIdx].slug,
        topicSlug: isNowOpen ? (topics[ti] ? topics[ti].slug : '') : '',
        articleSlug: '', kind: '',
      });
    }
  }

  function _setTopicOpen(ti, open) {
    var item   = _root && _root.querySelector('[data-ti="' + ti + '"]');
    if (!item) return;
    var btn    = item.querySelector('.snav__topic-header');
    var panel  = item.querySelector('.snav__article-list');
    item.classList.toggle('snav__topic-item--open', open);
    if (btn)   btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (panel) panel.hidden = !open;

    /* Swap chevron */
    var chev = btn && btn.querySelector('.snav__topic-chevron');
    if (chev) chev.innerHTML = open ? CHEVRON_DOWN : CHEVRON_RIGHT;
  }

  /* ------------------------------------------------------------------ */
  /* Load article list for a topic                                       */
  /* ------------------------------------------------------------------ */

  function _loadTopicArticles(topic, ti) {
    var slug = topic.slug;

    if (_topicCache[slug]) {
      _renderArticleList(ti, _topicCache[slug], topic);
      return;
    }

    Promise.all([
      window.BlogApi.listCmsPages({ topicSlug: slug }).catch(function () { return { data: [] }; }),
      window.BlogApi.getPosts({ topicSlug: slug, limit: 50 }).catch(function () { return { data: [] }; }),
    ]).then(function (results) {
      var pages = (results[0] && results[0].data) || [];
      var posts = (results[1] && results[1].data) || [];

      /* Merge into a flat list: pages first, then posts */
      var articles = [].concat(
        pages.map(function (p) { return { slug: p.slug, title: p.title, kind: 'page', excerpt: p.excerpt || '' }; }),
        posts.map(function (p) { return { slug: p.slug, title: p.title, kind: 'post', excerpt: p.excerpt || '' }; })
      );

      _topicCache[slug] = articles;
      /* Expose for app.js prev/next building */
      window._stsTopicArticles = window._stsTopicArticles || {};
      window._stsTopicArticles[slug] = articles;

      _renderArticleList(ti, articles, topic);
    });
  }

  function _renderArticleList(ti, articles, topic) {
    var panel = _root && _root.querySelector('#snav-articles-' + ti);
    if (!panel) return;

    if (!articles.length) {
      panel.innerHTML = '<p class="snav__article-empty muted">No articles yet in this section.</p>';
      return;
    }

    var group = _groupIdx >= 0 ? _data[_groupIdx] : null;
    var html  = '<ol class="snav__article-ol">';

    articles.forEach(function (art, ai) {
      html +=
        '<li class="snav__article-item">' +
          '<button class="snav__article-btn" type="button" ' +
            'data-slug="' + escapeHtml(art.slug) + '" ' +
            'data-kind="' + escapeHtml(art.kind) + '" ' +
            'data-ti="' + ti + '">' +
            '<span class="snav__article-num">' + (ai + 1) + '</span>' +
            '<span class="snav__article-title">' + escapeHtml(art.title) + '</span>' +
          '</button>' +
        '</li>';
    });

    html += '</ol>';
    panel.innerHTML = html;

    /* Wire article clicks */
    panel.querySelectorAll('.snav__article-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var slug      = btn.getAttribute('data-slug');
        var kind      = btn.getAttribute('data-kind');
        var topicIdx  = parseInt(btn.getAttribute('data-ti'), 10);
        var topicObj  = group ? (group.topics || [])[topicIdx] : null;
        var topicArticles = topicObj ? (_topicCache[topicObj.slug] || []) : [];

        /* Mark active */
        _root.querySelectorAll('.snav__article-btn').forEach(function (b) {
          b.classList.remove('snav__article-btn--active');
        });
        btn.classList.add('snav__article-btn--active');

        /* Build prev/next */
        var prevNext = _buildPrevNext(topicArticles, slug, group, topicObj);

        window.StsApp && window.StsApp.navigate({
          groupSlug:  group ? group.slug : '',
          groupName:  group ? group.name : '',
          topicSlug:  topicObj ? topicObj.slug : '',
          topicName:  topicObj ? topicObj.name : '',
          articleSlug: slug,
          kind:       kind,
          prevNext:   prevNext,
        });

        /* Auto-close sidebar on mobile after selecting article */
        var sidebar = document.querySelector('[data-sidebar]');
        if (sidebar && sidebar.classList.contains('is-open') && window.innerWidth < 961) {
          sidebar.classList.remove('is-open');
          document.body.classList.remove('sidebar-open');
          var overlay = document.querySelector('[data-sidebar-overlay]');
          if (overlay) overlay.hidden = true;
          var toggleBtn = document.querySelector('[data-sidebar-toggle]');
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  function _buildPrevNext(articles, currentSlug, group, topic) {
    var idx = -1;
    for (var i = 0; i < articles.length; i++) {
      if (articles[i].slug === currentSlug) { idx = i; break; }
    }
    if (idx === -1) return null;

    function enrich(art) {
      if (!art) return null;
      return Object.assign({}, art, {
        groupSlug: group ? group.slug : '',
        topicSlug: topic ? topic.slug : '',
      });
    }

    return {
      prev: enrich(idx > 0 ? articles[idx - 1] : null),
      next: enrich(idx < articles.length - 1 ? articles[idx + 1] : null),
    };
  }

  /* ------------------------------------------------------------------ */
  /* Search (level 0 only)                                               */
  /* ------------------------------------------------------------------ */

  function _bindSearch() {
    var input = _root && _root.querySelector('#snav-search');
    if (!input) return;
    input.addEventListener('input', function () {
      clearTimeout(_searchTimer);
      var q = input.value.trim();
      if (!q) { renderLevel0(); return; }
      _searchTimer = setTimeout(function () { _runSearch(q, input.value); }, 260);
    });
  }

  function _runSearch(q, rawVal) {
    if (window.BlogApi && window.BlogApi.searchSite) {
      window.BlogApi.searchSite(q)
        .then(function (res) { _renderSearchResults(res && res.data, rawVal); })
        .catch(function ()   { _renderClientFilter(q, rawVal); });
    } else {
      _renderClientFilter(q, rawVal);
    }
  }

  function _renderSearchResults(data, rawVal) {
    var topics   = (data && data.topics)   || [];
    var articles = (data && data.articles) || [];
    var html     = _searchHeader(rawVal);

    if (!topics.length && !articles.length) {
      html += '<p class="muted snav__search-empty">No matches found.</p>';
    }

    if (topics.length) {
      html += '<div class="snav__search-section"><p class="snav__search-heading">Sections</p><ul class="snav__search-list">';
      topics.forEach(function (t) {
        /* Find which group this topic belongs to */
        var groupIdx = -1;
        for (var gi = 0; gi < _data.length; gi++) {
          var found = (_data[gi].topics || []).some(function (tp) { return tp.slug === t.slug; });
          if (found) { groupIdx = gi; break; }
        }
        html += '<li><button class="snav__search-topic-btn" type="button" data-gi="' + groupIdx + '" data-topic-slug="' + escapeHtml(t.slug) + '">' +
          escapeHtml(t.name) + '</button></li>';
      });
      html += '</ul></div>';
    }

    if (articles.length) {
      html += '<div class="snav__search-section"><p class="snav__search-heading">Articles</p><ul class="snav__search-list">';
      articles.forEach(function (a) {
        html += '<li><button class="snav__search-art-btn" type="button" data-slug="' + escapeHtml(a.slug) + '" data-kind="' + escapeHtml(a.kind || 'post') + '" data-group="' + escapeHtml(a.group || '') + '" data-topic="' + escapeHtml(a.topic || '') + '">' +
          escapeHtml(a.title) + '</button></li>';
      });
      html += '</ul></div>';
    }

    _root.innerHTML = html;
    _bindSearchResults();
    var input = _root.querySelector('#snav-search');
    if (input) { input.focus(); try { input.setSelectionRange(input.value.length, input.value.length); } catch(e){} }
  }

  function _renderClientFilter(q, rawVal) {
    var lower = q.toLowerCase();
    var topics = [];
    _data.forEach(function (g, gi) {
      (g.topics || []).forEach(function (t) {
        if ((t.name || '').toLowerCase().indexOf(lower) !== -1) {
          topics.push({ name: t.name, slug: t.slug, gi: gi });
        }
      });
    });
    _renderSearchResults({ topics: topics, articles: [] }, rawVal);
  }

  function _searchHeader(rawVal) {
    return (
      '<div class="snav__l0-header">' +
        '<button class="snav__back-search-btn" type="button">' + BACK_ARROW + ' Back</button>' +
      '</div>' +
      '<div class="snav__search-wrap">' +
        '<label class="sr-only" for="snav-search">Search</label>' +
        '<input type="search" id="snav-search" class="sidebar__search-input snav__search" ' +
          'placeholder="Search topics or articles…" autocomplete="off" value="' + escapeHtml(rawVal) + '" />' +
      '</div>'
    );
  }

  function _bindSearchResults() {
    var backBtn = _root.querySelector('.snav__back-search-btn');
    if (backBtn) backBtn.addEventListener('click', renderLevel0);

    _root.querySelectorAll('.snav__search-topic-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var gi = parseInt(btn.getAttribute('data-gi'), 10);
        if (gi >= 0) gotoLevel1(gi);
        else renderLevel0();
      });
    });

    _root.querySelectorAll('.snav__search-art-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var slug  = btn.getAttribute('data-slug');
        var kind  = btn.getAttribute('data-kind');
        var gSlug = btn.getAttribute('data-group');
        var tSlug = btn.getAttribute('data-topic');
        window.StsApp && window.StsApp.navigate({
          groupSlug: gSlug, topicSlug: tSlug, articleSlug: slug, kind: kind,
        });
      });
    });

    _bindSearch();
  }

  /* ------------------------------------------------------------------ */
  /* External sync — called by app.js on hash change (back/fwd button)  */
  /* ------------------------------------------------------------------ */

  window.StsNav = {
    syncRoute: function (route) {
      if (!_data.length) return; /* sidebar not ready yet */

      if (!route.group) {
        if (_level !== 0) renderLevel0();
        return;
      }

      /* Find group index */
      var gi = -1;
      for (var i = 0; i < _data.length; i++) {
        if (_data[i].slug === route.group) { gi = i; break; }
      }
      if (gi < 0) return;

      if (_level !== 1 || _groupIdx !== gi) {
        _level = 1; _groupIdx = gi; _openTopicIdx = -1;
        renderLevel1();
      }

      if (route.topic) {
        var topics = _data[gi].topics || [];
        var ti = -1;
        for (var j = 0; j < topics.length; j++) {
          if (topics[j].slug === route.topic) { ti = j; break; }
        }
        if (ti >= 0 && _openTopicIdx !== ti) {
          if (_openTopicIdx >= 0) _setTopicOpen(_openTopicIdx, false);
          _openTopicIdx = ti;
          _setTopicOpen(ti, true);
          _loadTopicArticles(topics[ti], ti);
        }
      }

      /* Mark active article button */
      if (route.article) {
        setTimeout(function () {
          _root && _root.querySelectorAll('.snav__article-btn').forEach(function (btn) {
            btn.classList.toggle('snav__article-btn--active', btn.getAttribute('data-slug') === route.article);
          });
        }, 50);
      }
    },
  };

  /* ------------------------------------------------------------------ */
  /* Entry point (called by main.js after layout injection)              */
  /* ------------------------------------------------------------------ */

  function initDocSidebar() {
    _root = document.querySelector('[data-doc-sidebar-root]');
    if (!_root || !window.BlogApi) return;

    ensureTrackCss();
    _root.innerHTML = '<p class="muted">Loading navigation…</p>';

    window.BlogApi.getSidebar()
      .then(function (res) {
        _data = (res && res.data) || [];
        renderLevel0();
        /* Hand off to the router — it will set initial route-driven state */
        if (window.StsApp) {
          window.StsApp.init({ groups: _data });
        }
      })
      .catch(function () {
        _root.innerHTML = '<p class="muted">Could not load navigation. Is the API running?</p>';
      });
  }

  window.initDocSidebar = initDocSidebar;
  /* Legacy alias used by older pages */
  window.highlightActiveNav = function () {};
})();
