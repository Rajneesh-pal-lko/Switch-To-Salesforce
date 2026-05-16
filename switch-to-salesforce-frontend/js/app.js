/**
 * app.js — SPA main-content controller for the Switch To Salesforce reader.
 *
 * Responsibilities:
 *  • Hash-based routing (#group/topic/slug:kind) with history.pushState
 *  • Rendering the home welcome panel
 *  • Loading and rendering articles (posts + CMS pages) in #app-article
 *    without a full page reload
 *  • Prev / Next navigation inside a topic
 *  • Exposing window.StsApp so sidebar-doc.js can trigger navigation
 *  • Exposing window.StsNav so the router can sync the sidebar on back/fwd
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Helpers                                                              */
  /* ------------------------------------------------------------------ */

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  function absoluteUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    var origin = (window.BlogApi && window.BlogApi.API_ORIGIN) || '';
    return origin + (path.charAt(0) === '/' ? path : '/' + path);
  }

  function readEstimate(html) {
    var words = String(html || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200)) + ' min read';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch (e) { return ''; }
  }

  /* ------------------------------------------------------------------ */
  /* Hash routing                                                         */
  /* #groupSlug/topicSlug/articleSlug:kind                               */
  /* ------------------------------------------------------------------ */

  function parseHash(hash) {
    var h = (hash || '').replace(/^#\/?/, '');
    if (!h) return { group: '', topic: '', article: '', kind: '' };
    var parts = h.split('/');
    var group   = decodeURIComponent(parts[0] || '');
    var topic   = decodeURIComponent(parts[1] || '');
    var rawArt  = decodeURIComponent(parts[2] || '');
    var kind    = '';
    var article = rawArt;
    var ci = rawArt.lastIndexOf(':');
    if (ci !== -1) { article = rawArt.slice(0, ci); kind = rawArt.slice(ci + 1); }
    return { group: group, topic: topic, article: article, kind: kind };
  }

  function buildHash(group, topic, article, kind) {
    if (!group) return '#';
    var h = '#' + encodeURIComponent(group);
    if (topic)   h += '/' + encodeURIComponent(topic);
    if (article) h += '/' + encodeURIComponent(article) + (kind ? ':' + kind : '');
    return h;
  }

  /* ------------------------------------------------------------------ */
  /* Panel references (set on DOMContentLoaded)                          */
  /* ------------------------------------------------------------------ */

  var $home    = null;
  var $article = null;

  function showHome() {
    if ($home)    $home.hidden    = false;
    if ($article) $article.hidden = true;
  }

  function showArticlePanel() {
    if ($home)    $home.hidden    = true;
    if ($article) $article.hidden = false;
  }

  /* ------------------------------------------------------------------ */
  /* Home panel                                                           */
  /* ------------------------------------------------------------------ */

  function renderHome() {
    if (!$home) return;
    $home.innerHTML =
      '<div class="app-home">' +

        /* ── Hero ─────────────────────────────────────────────── */
        '<section class="hp-hero">' +
          '<div class="hp-badge">Free Learning Platform</div>' +
          '<h1 class="hp-hero__title">' +
            'Salesforce Interview Prep<br>' +
            'for <span class="hp-accent">Freshers</span>' +
          '</h1>' +
          '<p class="hp-hero__sub">' +
            'Prepare for your first Salesforce interview with structured topics, ' +
            'essential concepts, and beginner-friendly interview questions.' +
          '</p>' +
          '<div class="hp-hero__actions">' +
            '<button class="hp-btn hp-btn--primary" id="hp-start-btn">Start Preparing →</button>' +
            '<a class="hp-btn hp-btn--outline" href="https://blog.switchtosalesforce.com/" ' +
              'target="_blank" rel="noopener">Browse Articles</a>' +
          '</div>' +
        '</section>' +

        /* ── Supporting text ──────────────────────────────────── */
        '<p class="hp-support">' +
          'Built to help aspiring Salesforce professionals prepare with clarity and confidence.' +
        '</p>' +

        /* ── How it works ─────────────────────────────────────── */
        '<section class="hp-how">' +
          '<p class="hp-label">How it works</p>' +
          '<div class="hp-steps">' +
            '<div class="hp-step">' +
              '<div class="hp-step__num">01</div>' +
              '<div class="hp-step__text">Start with beginner-friendly topics</div>' +
            '</div>' +
            '<div class="hp-step">' +
              '<div class="hp-step__num">02</div>' +
              '<div class="hp-step__text">Follow articles in recommended order</div>' +
            '</div>' +
            '<div class="hp-step">' +
              '<div class="hp-step__num">03</div>' +
              '<div class="hp-step__text">Revise and prepare for interviews</div>' +
            '</div>' +
          '</div>' +
        '</section>' +

        /* ── Highlight card ───────────────────────────────────── */
        '<section class="hp-highlight">' +
          '<p class="hp-label">Featured Guide</p>' +
          '<div class="hp-featured-card">' +
            '<div class="hp-featured-card__tag">Start Here</div>' +
            '<h2 class="hp-featured-card__title">Freshers Interview Preparation</h2>' +
            '<p class="hp-featured-card__desc">' +
              'Core Salesforce concepts, foundational understanding, and common interview ' +
              'questions designed for beginners entering the Salesforce ecosystem.' +
            '</p>' +
            '<button class="hp-btn hp-btn--primary hp-btn--sm" id="hp-card-btn">Start Learning →</button>' +
          '</div>' +
        '</section>' +

        /* ── Coming soon ──────────────────────────────────────── */
        '<p class="hp-coming-soon">' +
          'Coming Soon: Advanced Freshers, Developer Interview Prep, Integrations, Scenario-Based Questions' +
        '</p>' +

      '</div>';

    showHome();
    document.title = 'Switch To Salesforce — Salesforce Interview Prep for Freshers';

    /* Wire "Start Preparing" and "Start Learning" buttons */
    function goToFreshers() {
      var groups = (window._stsNavData && window._stsNavData.groups) || [];
      /* Find first group whose name or slug contains "fresher" */
      for (var i = 0; i < groups.length; i++) {
        if (/fresher/i.test(groups[i].name) || /fresher/i.test(groups[i].slug)) {
          if (window.StsNav && window.StsNav.goToGroupBySlug) {
            window.StsNav.goToGroupBySlug(groups[i].slug);
          }
          return;
        }
      }
      /* Fallback: open first group */
      if (groups.length && window.StsNav && window.StsNav.goToGroupBySlug) {
        window.StsNav.goToGroupBySlug(groups[0].slug);
      }
    }

    var startBtn = document.getElementById('hp-start-btn');
    if (startBtn) startBtn.addEventListener('click', goToFreshers);
    var cardBtn = document.getElementById('hp-card-btn');
    if (cardBtn) cardBtn.addEventListener('click', goToFreshers);
  }

  /* ------------------------------------------------------------------ */
  /* Loading skeleton                                                     */
  /* ------------------------------------------------------------------ */

  function showLoading() {
    if (!$article) return;
    showArticlePanel();
    $article.innerHTML =
      '<div class="spa-loading" aria-busy="true" aria-label="Loading article">' +
        '<div class="spa-loading__bar"></div>' +
        '<div class="spa-loading__title"></div>' +
        '<div class="spa-loading__line"></div>' +
        '<div class="spa-loading__line spa-loading__line--short"></div>' +
        '<div class="spa-loading__line"></div>' +
        '<div class="spa-loading__line spa-loading__line--med"></div>' +
      '</div>';
  }

  /* ------------------------------------------------------------------ */
  /* HTML content sanitiser — strips embedded <style>/<link> tags so    */
  /* the shared site CSS drives all presentation.                        */
  /* ------------------------------------------------------------------ */

  function sanitiseHtml(html) {
    return String(html || '')
      /* Remove <style>...</style> blocks (article-specific inline CSS) */
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      /* Remove any <link rel="stylesheet"> the author may have added */
      .replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, '')
      /* Remove dangerous tags (script, iframe, etc.) */
      .replace(/<\/?(script|iframe|object|embed|body|html)[^>]*>/gi, '');
  }

  /* ------------------------------------------------------------------ */
  /* Prev / Next nav at the bottom of the article                        */
  /* ------------------------------------------------------------------ */

  function renderPrevNext(prevNext) {
    if (!prevNext || (!prevNext.prev && !prevNext.next)) return '';
    var html = '<nav class="spa-prev-next" aria-label="Next and previous articles">';
    if (prevNext.prev) {
      var p = prevNext.prev;
      html +=
        '<a class="spa-prev-next__item spa-prev-next__prev" ' +
        'href="' + escapeHtml(buildHash(p.groupSlug, p.topicSlug, p.slug, p.kind)) + '">' +
        '<span class="spa-pn-dir">← Previous</span>' +
        '<span class="spa-pn-title">' + escapeHtml(p.title) + '</span>' +
        '</a>';
    }
    if (prevNext.next) {
      var n = prevNext.next;
      html +=
        '<a class="spa-prev-next__item spa-prev-next__next" ' +
        'href="' + escapeHtml(buildHash(n.groupSlug, n.topicSlug, n.slug, n.kind)) + '">' +
        '<span class="spa-pn-dir">Next →</span>' +
        '<span class="spa-pn-title">' + escapeHtml(n.title) + '</span>' +
        '</a>';
    }
    html += '</nav>';
    return html;
  }

  /* ------------------------------------------------------------------ */
  /* Article renderer                                                     */
  /* ------------------------------------------------------------------ */

  function renderArticle(data, kind, ctx) {
    if (!$article) return;
    showArticlePanel();

    var title = data.title || '(untitled)';
    document.title = title + ' — Switch To Salesforce';

    /* Breadcrumb */
    var breadcrumb = '';
    if (ctx && ctx.groupName && ctx.topicName) {
      breadcrumb =
        '<nav class="spa-breadcrumb" aria-label="Breadcrumb">' +
          '<button class="spa-bc-btn" data-bc="group" data-group="' + escapeHtml(ctx.groupSlug) + '">' +
            escapeHtml(ctx.groupName) +
          '</button>' +
          '<span class="spa-bc-sep" aria-hidden="true">›</span>' +
          '<button class="spa-bc-btn" data-bc="topic" ' +
            'data-group="' + escapeHtml(ctx.groupSlug) + '" ' +
            'data-topic="' + escapeHtml(ctx.topicSlug) + '">' +
            escapeHtml(ctx.topicName) +
          '</button>' +
        '</nav>';
    }

    var isHtml = data.contentFormat === 'html';
    var cover  = data.coverImage ? absoluteUrl(data.coverImage) : '';
    var date   = formatDate(data.updatedAt || data.createdAt);

    /* All formats render inline — HTML articles have their <style> blocks stripped
       so the shared site CSS (article-guide.css, cms-html-shared.css) drives presentation. */
    var bodyContent = isHtml ? sanitiseHtml(data.content || '') : (data.content || '');
    var bodyHtml =
      '<div class="article-html-guide not-prose"><div class="blog cms-body">' +
        bodyContent +
      '</div></div>';

    $article.innerHTML =
      '<article class="article spa-article">' +
        breadcrumb +
        (cover ? '<div class="article-cover"><img src="' + escapeHtml(cover) + '" alt="" loading="lazy"/></div>' : '') +
        '<header class="article-header">' +
          '<h1 class="article-title">' + escapeHtml(title) + '</h1>' +
          '<div class="spa-article-meta">' +
            (date ? '<time class="spa-article-date">' + escapeHtml(date) + '</time>' : '') +
            '<span class="spa-article-read">' + readEstimate(data.content) + '</span>' +
          '</div>' +
        '</header>' +
        bodyHtml +
        (ctx && ctx.prevNext ? renderPrevNext(ctx.prevNext) : '') +
      '</article>';

    /* Wire breadcrumb buttons */
    $article.querySelectorAll('[data-bc]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var gSlug = btn.getAttribute('data-group');
        var tSlug = btn.getAttribute('data-topic');
        if (btn.getAttribute('data-bc') === 'group') {
          window.StsApp.navigate({ groupSlug: gSlug, topicSlug: '', articleSlug: '', kind: '' });
        } else {
          window.StsApp.navigate({ groupSlug: gSlug, topicSlug: tSlug, articleSlug: '', kind: '' });
        }
      });
    });

    /* Syntax highlight code blocks in all formats */
    if (window.Prism) {
      window.Prism.highlightAllUnder($article);
    }

    /* Scroll main area to top */
    var main = document.getElementById('main-content');
    if (main) main.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ------------------------------------------------------------------ */
  /* Article fetcher (with cache)                                        */
  /* ------------------------------------------------------------------ */

  var _articleCache = {};

  function loadArticle(slug, kind, ctx) {
    if (!slug) { renderHome(); return; }

    var key = (kind || 'auto') + ':' + slug;
    if (_articleCache[key]) {
      renderArticle(_articleCache[key], kind, ctx);
      return;
    }

    showLoading();

    var fetcher;
    if (kind === 'page') {
      fetcher = window.BlogApi.getCmsPageBySlug(slug);
    } else if (kind === 'post') {
      fetcher = window.BlogApi.getPost(slug);
    } else {
      /* Auto-detect: try post first, fall back to page */
      fetcher = window.BlogApi.getPost(slug).catch(function () {
        return window.BlogApi.getCmsPageBySlug(slug);
      });
    }

    fetcher
      .then(function (res) {
        var data = res && res.data;
        if (!data) throw new Error('empty');
        _articleCache[key] = data;
        renderArticle(data, kind, ctx);
      })
      .catch(function () {
        showArticlePanel();
        $article.innerHTML =
          '<div class="empty-state empty-state--compact">' +
            '<p class="empty-state__title">Article not found</p>' +
            '<p class="empty-state__hint">This article could not be loaded. Check your connection or try again.</p>' +
          '</div>';
      });
  }

  /* ------------------------------------------------------------------ */
  /* Router — drive state from URL hash                                  */
  /* ------------------------------------------------------------------ */

  function handleRoute(skipSidebarSync) {
    var route = parseHash(window.location.hash);

    if (!route.article) {
      renderHome();
      if (!skipSidebarSync && window.StsNav && window.StsNav.syncRoute) {
        window.StsNav.syncRoute(route);
      }
      return;
    }

    /* Build ctx — sidebar may have cached article lists */
    var ctx = _buildCtx(route);
    loadArticle(route.article, route.kind || 'auto', ctx);

    if (!skipSidebarSync && window.StsNav && window.StsNav.syncRoute) {
      window.StsNav.syncRoute(route);
    }
  }

  function _buildCtx(route) {
    var navData  = window._stsNavData || {};
    var groups   = navData.groups || [];
    var group    = null;
    var topic    = null;

    for (var i = 0; i < groups.length; i++) {
      if (groups[i].slug === route.group) { group = groups[i]; break; }
    }
    if (group) {
      var topics = group.topics || [];
      for (var j = 0; j < topics.length; j++) {
        if (topics[j].slug === route.topic) { topic = topics[j]; break; }
      }
    }

    /* Prev/next from cached topic article list */
    var prevNext = null;
    var cached = window._stsTopicArticles && window._stsTopicArticles[route.topic];
    if (cached) prevNext = _getPrevNext(cached, route.article, route.group, route.topic);

    return {
      groupName:  group ? group.name  : route.group,
      groupSlug:  route.group,
      topicName:  topic ? topic.name  : route.topic,
      topicSlug:  route.topic,
      prevNext:   prevNext,
    };
  }

  function _getPrevNext(articles, currentSlug, groupSlug, topicSlug) {
    var idx = -1;
    for (var i = 0; i < articles.length; i++) {
      if (articles[i].slug === currentSlug) { idx = i; break; }
    }
    if (idx === -1) return null;
    return {
      prev: idx > 0
        ? Object.assign({}, articles[idx - 1], { groupSlug: groupSlug, topicSlug: topicSlug })
        : null,
      next: idx < articles.length - 1
        ? Object.assign({}, articles[idx + 1], { groupSlug: groupSlug, topicSlug: topicSlug })
        : null,
    };
  }

  /* ------------------------------------------------------------------ */
  /* Public API                                                           */
  /* ------------------------------------------------------------------ */

  /**
   * window.StsApp.navigate(opts)
   * Called by sidebar-doc.js when user clicks a group, topic, or article.
   * opts = { groupSlug, topicSlug, articleSlug, kind, groupName, topicName, prevNext }
   */
  window.StsApp = {
    navigate: function (opts) {
      var hash = buildHash(opts.groupSlug || '', opts.topicSlug || '', opts.articleSlug || '', opts.kind || '');
      if (window.location.hash !== hash) {
        history.pushState(null, '', hash || window.location.pathname);
      }
      if (opts.articleSlug) {
        loadArticle(opts.articleSlug, opts.kind || 'auto', {
          groupName:  opts.groupName  || opts.groupSlug  || '',
          groupSlug:  opts.groupSlug  || '',
          topicName:  opts.topicName  || opts.topicSlug  || '',
          topicSlug:  opts.topicSlug  || '',
          prevNext:   opts.prevNext   || null,
        });
      } else {
        renderHome();
      }
    },

    /**
     * Called by sidebar-doc.js once the sidebar data is loaded.
     * Drives the initial route so the correct article/state loads on first visit.
     */
    init: function (navData) {
      window._stsNavData = navData;
      handleRoute(true); /* sidebar will set its own initial state */
    },
  };

  /* ------------------------------------------------------------------ */
  /* Browser back / forward                                              */
  /* ------------------------------------------------------------------ */
  window.addEventListener('popstate', function () { handleRoute(false); });
  /* hashchange fires for back/fwd on same-origin hash links */
  window.addEventListener('hashchange', function () { handleRoute(false); });

  /* ------------------------------------------------------------------ */
  /* Boot                                                                 */
  /* ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    $home    = document.getElementById('app-home');
    $article = document.getElementById('app-article');
    renderHome(); /* show welcome immediately; real route handled after sidebar loads */
  });
})();
