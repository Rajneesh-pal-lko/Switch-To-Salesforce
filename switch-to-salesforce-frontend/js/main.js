(function () {
  var THEME_KEY = 'switch-to-salesforce-theme';

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function setTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem(THEME_KEY, mode);
    var btn = document.querySelector('[data-theme-toggle]');
    if (btn) {
      btn.setAttribute('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.textContent = mode === 'dark' ? 'Light' : 'Dark';
    }
  }

  var themeToggleDelegationBound = false;

  /** One listener only — injectComponent runs 3× (navbar/sidebar/footer); per-button listeners stacked and cancelled each other out. */
  function bindThemeToggle() {
    if (themeToggleDelegationBound) return;
    themeToggleDelegationBound = true;
    document.addEventListener(
      'click',
      function (e) {
        var btn = e.target && e.target.closest && e.target.closest('[data-theme-toggle]');
        if (!btn) return;
        e.preventDefault();
        var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(next);
      },
      false
    );
  }

  function fetchText(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('Failed to load ' + url);
      return r.text();
    });
  }

  function injectComponent(selector, html) {
    var root = document.querySelector(selector);
    if (!root) return;
    root.innerHTML = html;
    highlightActiveNav();
  }

  /**
   * Slug routes: query params (?group=&topic=) or path /:group/:topic(/:slug) when using static hosting rewrites.
   */
  function getDocRouteParams() {
    var pageParams = new URLSearchParams(window.location.search);
    var g = pageParams.get('group');
    var t = pageParams.get('topic');
    var slug = pageParams.get('slug');
    if (g && t) {
      return { group: g, topic: t, slug: slug || '' };
    }
    var segs = window.location.pathname.replace(/^\//, '').split('/').filter(Boolean);
    if (segs.length >= 2) {
      var last = segs[segs.length - 1];
      if (!/\.html$/i.test(last)) {
        if (segs.length === 2) {
          return {
            group: decodeURIComponent(segs[0]),
            topic: decodeURIComponent(segs[1]),
            slug: '',
          };
        }
        if (segs.length >= 3) {
          return {
            group: decodeURIComponent(segs[0]),
            topic: decodeURIComponent(segs[1]),
            slug: decodeURIComponent(segs[2]),
          };
        }
      }
    }
    return { group: g || '', topic: t || '', slug: slug || '' };
  }

  function highlightActiveNav() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    var pageParams = new URLSearchParams(window.location.search);
    var route = getDocRouteParams();
    var currentSlug = pageParams.get('slug') || route.slug;
    var curGroup = route.group;
    var curTopic = route.topic;
    document.querySelectorAll('[data-nav-link]').forEach(function (a) {
      a.classList.remove('is-active');
      a.removeAttribute('aria-current');
    });
    var isTopicPage = document.body.getAttribute('data-page') === 'topic';

    document.querySelectorAll('[data-nav-link]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;

      if (isTopicPage && curGroup && curTopic) {
        if (href.charAt(0) === '/') {
          var pathParts = href.replace(/^\//, '').split('/').filter(Boolean);
          if (
            pathParts.length === 2 &&
            decodeURIComponent(pathParts[0]) === curGroup &&
            decodeURIComponent(pathParts[1]) === curTopic
          ) {
            a.classList.add('is-active');
            a.setAttribute('aria-current', 'page');
          }
          return;
        }
        var hpt = href.indexOf('?');
        if (hpt !== -1) {
          var pst = new URLSearchParams(href.slice(hpt));
          if (pst.get('group') === curGroup && pst.get('topic') === curTopic) {
            a.classList.add('is-active');
            a.setAttribute('aria-current', 'page');
          }
        }
        return;
      }

      if (path === 'category.html' || path === 'page.html' || path === 'post.html') {
        var hp2 = href.indexOf('?');
        var linkSlug = '';
        if (hp2 !== -1) {
          linkSlug = new URLSearchParams(href.slice(hp2)).get('slug') || '';
        }
        if (currentSlug && linkSlug && currentSlug === linkSlug) {
          if (path === 'post.html' || path === 'page.html') {
            var lg = hp2 !== -1 ? new URLSearchParams(href.slice(hp2)).get('group') : null;
            var lt = hp2 !== -1 ? new URLSearchParams(href.slice(hp2)).get('topic') : null;
            if (curGroup && curTopic && (lg !== curGroup || lt !== curTopic)) {
              return;
            }
          }
          a.classList.add('is-active');
          a.setAttribute('aria-current', 'page');
        }
        return;
      }

      var pathPart = href.split('?')[0].split('/').pop();
      if (pathPart !== path) return;
      var name = href.split('/').pop();
      if (name === path) {
        a.classList.add('is-active');
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  window.highlightActiveNav = highlightActiveNav;

  function loadLayout() {
    var base = '';
    return Promise.all([
      fetchText(base + 'components/navbar.html'),
      fetchText(base + 'components/sidebar.html'),
      fetchText(base + 'components/footer.html'),
    ]).then(function (parts) {
      injectComponent('[data-include="navbar"]', parts[0]);
      injectComponent('[data-include="sidebar"]', parts[1]);
      injectComponent('[data-include="footer"]', parts[2]);
      setTheme(getTheme());
      bindThemeToggle();
      initMobileSidebar();
      return null;
    });
  }

  function initMobileSidebar() {
    var sidebar = document.querySelector('[data-sidebar]');
    var toggle = document.querySelector('[data-sidebar-toggle]');
    var overlay = document.querySelector('[data-sidebar-overlay]');
    if (!sidebar || !toggle) return;
    function open() {
      sidebar.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('sidebar-open');
      if (overlay) overlay.hidden = false;
    }
    function close() {
      sidebar.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('sidebar-open');
      if (overlay) overlay.hidden = true;
    }
    toggle.addEventListener('click', function () {
      if (sidebar.classList.contains('is-open')) close();
      else open();
    });
    if (overlay) overlay.addEventListener('click', close);
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

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
    var origin = window.BlogApi.API_ORIGIN;
    return origin + (path.charAt(0) === '/' ? path : '/' + path);
  }

  function renderBlogCards(container, posts) {
    if (!container) return;
    if (!posts || !posts.length) {
      container.innerHTML = '<p class="muted">No posts yet.</p>';
      return;
    }
    container.innerHTML = posts
      .map(function (p) {
        var cat = p.category && p.category.name ? p.category.name : '';
        var excerpt = p.excerpt || String(p.content || '').replace(/<[^>]+>/g, '').slice(0, 160);
        var cover = p.coverImage ? absoluteUploadUrl(p.coverImage) : '';
        return (
          '<article class="blog-card">' +
          (cover
            ? '<a class="blog-card__media" href="post.html?slug=' +
              encodeURIComponent(p.slug) +
              '"><img src="' +
              escapeHtml(cover) +
              '" alt="" loading="lazy"/></a>'
            : '') +
          '<div class="blog-card__body">' +
          (cat ? '<span class="blog-card__category">' + escapeHtml(cat) + '</span>' : '') +
          '<h2 class="blog-card__title"><a href="post.html?slug=' +
          encodeURIComponent(p.slug) +
          '">' +
          escapeHtml(p.title) +
          '</a></h2>' +
          '<p class="blog-card__excerpt">' +
          escapeHtml(excerpt) +
          (excerpt.length >= 160 ? '…' : '') +
          '</p>' +
          '<a class="btn btn--primary blog-card__cta" href="post.html?slug=' +
          encodeURIComponent(p.slug) +
          '">Read more</a>' +
          '</div></article>'
        );
      })
      .join('');
  }

  function renderPagination(el, page, totalPages, onPage) {
    if (!el || totalPages <= 1) {
      if (el) el.innerHTML = '';
      return;
    }
    var html = '<nav class="pagination" aria-label="Pagination"><ul>';
    for (var i = 1; i <= totalPages; i++) {
      html +=
        '<li><button type="button" class="pagination__btn' +
        (i === page ? ' is-current' : '') +
        '" data-page="' +
        i +
        '">' +
        i +
        '</button></li>';
    }
    html += '</ul></nav>';
    el.innerHTML = html;
    el.querySelectorAll('[data-page]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = parseInt(btn.getAttribute('data-page'), 10);
        if (onPage) onPage(p);
      });
    });
  }

  function initBlogPage() {
    var listEl = document.getElementById('blog-list');
    var pagEl = document.getElementById('blog-pagination');
    if (!listEl) return;

    var state = { page: 1, limit: 9 };

    function load() {
      listEl.innerHTML = '<p class="muted">Loading…</p>';
      window.BlogApi.getPosts({ page: state.page, limit: state.limit })
        .then(function (res) {
          renderBlogCards(listEl, res.data);
          var tp = res.pagination && res.pagination.totalPages ? res.pagination.totalPages : 1;
          renderPagination(pagEl, state.page, tp, function (p) {
            state.page = p;
            load();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        })
        .catch(function () {
          listEl.innerHTML = '<p class="error">Could not load posts. Is the API running?</p>';
        });
    }
    load();
  }

  function initCategoryPage() {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get('slug');
    var titleEl = document.getElementById('category-title');
    var listEl = document.getElementById('category-list');
    var pagEl = document.getElementById('category-pagination');
    if (!listEl || !slug) {
      if (titleEl) titleEl.textContent = 'Category';
      if (listEl) listEl.innerHTML = '<p class="muted">Pick a category from the sidebar.</p>';
      return;
    }

    window.BlogApi.getCategories()
      .then(function (res) {
        var cat = (res.data || []).find(function (c) {
          return c.slug === slug;
        });
        if (titleEl) titleEl.textContent = cat ? cat.name : slug;
      })
      .catch(function () {});

    var state = { page: 1, limit: 9 };

    function load() {
      listEl.innerHTML = '<p class="muted">Loading…</p>';
      window.BlogApi.getPosts({ page: state.page, limit: state.limit, category: slug })
        .then(function (res) {
          renderBlogCards(listEl, res.data);
          var tp = res.pagination && res.pagination.totalPages ? res.pagination.totalPages : 1;
          renderPagination(pagEl, state.page, tp, function (p) {
            state.page = p;
            load();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        })
        .catch(function () {
          listEl.innerHTML = '<p class="error">Could not load posts.</p>';
        });
    }
    load();
  }

  function initHomeFeatured() {
    var el = document.getElementById('home-featured');
    if (!el) return;
    window.BlogApi.getPosts({ page: 1, limit: 3 })
      .then(function (res) {
        renderBlogCards(el, res.data);
      })
      .catch(function () {
        el.innerHTML =
          '<div class="empty-state empty-state--compact">' +
          '<p class="empty-state__title">Couldn’t load posts</p>' +
          '<p class="empty-state__hint">Check your internet connection. If you just deployed, ensure the production API URL is set on your frontend host and redeploy.</p>' +
          '</div>';
      });
  }

  function initContactForm() {
    var form = document.getElementById('newsletter-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('[name="email"]').value;
      var msg = document.getElementById('newsletter-msg');
      window.BlogApi
        .subscribe(email)
        .then(function () {
          if (msg) {
            msg.textContent = 'Thanks — you are subscribed.';
            msg.className = 'form-msg success';
          }
          form.reset();
        })
        .catch(function () {
          if (msg) {
            msg.textContent = 'Could not subscribe. Try again later.';
            msg.className = 'form-msg error';
          }
        });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setTheme(getTheme());
    bindThemeToggle();
    loadLayout().then(function () {
      if (typeof window.initDocSidebar === 'function') {
        window.initDocSidebar();
      }
      var page = document.body.getAttribute('data-page');
      if (page === 'blog') initBlogPage();
      if (page === 'category') initCategoryPage();
      if (page === 'home') initHomeFeatured();
      if (page === 'contact') initContactForm();
      if (page === 'cms-page') initCmsPage();
      if (page === 'topic') initTopicPage();
    });
  });

  function initTopicPage() {
    if (typeof window.runTopicPage === 'function') {
      window.runTopicPage();
    }
  }

  function initCmsPage() {
    var root = document.getElementById('cms-page-root');
    if (!root || !window.BlogApi || !window.BlogApi.getCmsPageBySlug) return;
    var params = new URLSearchParams(window.location.search);
    var slug = params.get('slug');
    if (!slug) {
      root.innerHTML = '<p class="muted">Missing page slug.</p>';
      return;
    }
    document.title = 'Loading… — Switch To Salesforce';
    window.BlogApi
      .getCmsPageBySlug(slug)
      .then(function (res) {
        var page = res && res.data;
        if (!page) {
          root.innerHTML = '<p class="muted">Page not found.</p>';
          return;
        }
        document.title = page.title + ' — Switch To Salesforce';
        var meta = document.querySelector('meta[name="description"]');
        if (meta) {
          meta.setAttribute(
            'content',
            String(page.content || '')
              .replace(/<[^>]+>/g, '')
              .slice(0, 160)
          );
        }
        var cover = page.coverImage ? absoluteUploadUrl(page.coverImage) : '';
        var author = page.author ? '<p class="article-meta">' + escapeHtml(page.author) + '</p>' : '';
        var date =
          page.updatedAt || page.createdAt
            ? '<time class="article-date">' +
              escapeHtml(
                new Date(page.updatedAt || page.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              ) +
              '</time>'
            : '';
        root.innerHTML =
          '<article class="article">' +
          (cover ? '<div class="article-cover"><img src="' + escapeHtml(cover) + '" alt=""/></div>' : '') +
          '<header class="article-header"><h1 class="article-title">' +
          escapeHtml(page.title) +
          '</h1>' +
          date +
          author +
          '</header>' +
          '<div class="article-body cms-body">' +
          page.content +
          '</div></article>';
        if (window.Prism) {
          window.Prism.highlightAllUnder(root);
        }
      })
      .catch(function () {
        root.innerHTML =
          '<div class="empty-state empty-state--compact">' +
          '<p class="empty-state__title">Page not found</p>' +
          '<p class="empty-state__hint">This topic may not have a page yet, or the API is unavailable.</p>' +
          '</div>';
        document.title = 'Page — Switch To Salesforce';
      });
  }

})();
