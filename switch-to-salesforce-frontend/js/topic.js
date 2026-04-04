/**
 * Topic landing page: lists CMS pages and blog posts for a sidebar topic (group + topic slugs).
 */
(function () {
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function absoluteUploadUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    var origin = window.BlogApi && window.BlogApi.API_ORIGIN;
    if (!origin) return path;
    return origin + (path.charAt(0) === '/' ? path : '/' + path);
  }

  function articleHref(kind, group, topic, slug) {
    if (window.StsRoutes && window.StsRoutes.articleUrl) {
      return window.StsRoutes.articleUrl(group || '', topic || '', slug, kind);
    }
    if (kind === 'page') {
      return 'page.html?slug=' + encodeURIComponent(slug);
    }
    return 'post.html?slug=' + encodeURIComponent(slug);
  }

  function runTopicPage() {
    var root = document.getElementById('topic-root');
    if (!root || !window.BlogApi) return;

    var params = new URLSearchParams(window.location.search);
    var groupSlug = params.get('group') || '';
    var topicSlug = params.get('topic') || '';
    if (!topicSlug) {
      var segs = window.location.pathname.replace(/^\//, '').split('/').filter(Boolean);
      if (segs.length === 2 && !/\.html$/i.test(segs[1])) {
        groupSlug = decodeURIComponent(segs[0]);
        topicSlug = decodeURIComponent(segs[1]);
      }
    }
    if (!topicSlug) {
      root.innerHTML = '<p class="muted">Missing topic.</p>';
      return;
    }

    root.innerHTML = '<p class="muted">Loading…</p>';

    var sidebarPromise = window.BlogApi.getSidebar().catch(function () {
      return { data: [] };
    });

    Promise.all([
      sidebarPromise,
      window.BlogApi.listCmsPages({ topicSlug: topicSlug }).catch(function () {
        return { data: [] };
      }),
      window.BlogApi.getPosts({ topicSlug: topicSlug, limit: 50 }).catch(function () {
        return { data: [] };
      }),
    ])
      .then(function (parts) {
        var sidebarRes = parts[0];
        var pagesRes = parts[1];
        var postsRes = parts[2];

        var groups = (sidebarRes && sidebarRes.data) || [];
        var topicName = topicSlug;
        var gName = groupSlug;
        groups.forEach(function (g) {
          var gs = g.slug || '';
          if (groupSlug && gs !== groupSlug) return;
          (g.topics || []).forEach(function (t) {
            if (t.slug === topicSlug) {
              topicName = t.name || topicSlug;
              gName = g.name || groupSlug;
            }
          });
        });

        var pages = (pagesRes && pagesRes.data) || [];
        var posts = (postsRes && postsRes.data) || [];

        document.title = topicName + ' — Switch To Salesforce';

        var breadcrumb =
          '<nav class="breadcrumb" aria-label="Breadcrumb">' +
          '<a href="index.html">Home</a>' +
          '<span class="breadcrumb__sep">/</span>' +
          '<span aria-current="page">' +
          escapeHtml(topicName) +
          '</span></nav>';

        var intro =
          '<header class="topic-header"><h1 class="article-title">' +
          escapeHtml(topicName) +
          '</h1>' +
          (gName
            ? '<p class="muted">' + escapeHtml(gName) + '</p>'
            : '') +
          '</header>';

        var sectionPages = '';
        if (pages.length) {
          sectionPages +=
            '<section class="topic-section"><h2 class="section-title">Pages</h2><ul class="topic-list">';
          pages.forEach(function (p) {
            var href = articleHref('page', groupSlug, topicSlug, p.slug);
            sectionPages +=
              '<li><a data-nav-link href="' +
              escapeHtml(href) +
              '">' +
              escapeHtml(p.title) +
              '</a></li>';
          });
          sectionPages += '</ul></section>';
        }

        var sectionPosts = '';
        if (posts.length) {
          sectionPosts +=
            '<section class="topic-section"><h2 class="section-title">Articles</h2><div class="topic-cards">';
          posts.forEach(function (p) {
            var excerpt = p.excerpt || String(p.content || '').replace(/<[^>]+>/g, '').slice(0, 140);
            var cover = p.coverImage ? absoluteUploadUrl(p.coverImage) : '';
            var href = articleHref('post', groupSlug, topicSlug, p.slug);
            sectionPosts +=
              '<article class="topic-card">' +
              (cover
                ? '<a class="topic-card__media" href="' +
                  escapeHtml(href) +
                  '"><img src="' +
                  escapeHtml(cover) +
                  '" alt="" loading="lazy"/></a>'
                : '') +
              '<div class="topic-card__body">' +
              '<h3 class="topic-card__title"><a data-nav-link href="' +
              escapeHtml(href) +
              '">' +
              escapeHtml(p.title) +
              '</a></h3>' +
              '<p class="topic-card__excerpt muted">' +
              escapeHtml(excerpt) +
              (excerpt.length >= 140 ? '…' : '') +
              '</p></div></article>';
          });
          sectionPosts += '</div></section>';
        }

        if (!pages.length && !posts.length) {
          root.innerHTML =
            breadcrumb +
            intro +
            '<div class="empty-state empty-state--compact"><p class="empty-state__title">No content yet</p>' +
            '<p class="empty-state__hint">Add CMS pages or posts aligned with this topic slug.</p></div>';
          if (window.highlightActiveNav) window.highlightActiveNav();
          return;
        }

        root.innerHTML = breadcrumb + intro + sectionPages + sectionPosts;
        if (window.highlightActiveNav) window.highlightActiveNav();
      })
      .catch(function () {
        root.innerHTML = '<p class="error">Could not load this topic.</p>';
      });
  }

  window.runTopicPage = runTopicPage;
})();
