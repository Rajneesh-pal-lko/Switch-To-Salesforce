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

  function highlightActiveNav() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    var pageParams = new URLSearchParams(window.location.search);
    var currentSlug = pageParams.get('slug');
    document.querySelectorAll('[data-nav-link]').forEach(function (a) {
      a.classList.remove('is-active');
      a.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-nav-link]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;
      var pathPart = href.split('?')[0].split('/').pop();
      if (pathPart !== path) return;
      if (path === 'category.html') {
        var hp = href.indexOf('?');
        var linkSlug = '';
        if (hp !== -1) {
          linkSlug = new URLSearchParams(href.slice(hp)).get('slug') || '';
        }
        if (currentSlug && linkSlug && currentSlug === linkSlug) {
          a.classList.add('is-active');
          a.setAttribute('aria-current', 'page');
        }
        return;
      }
      var name = href.split('/').pop();
      if (name === path) {
        a.classList.add('is-active');
        a.setAttribute('aria-current', 'page');
      }
    });
  }

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
      populateSidebarFromApi();
      var page = document.body.getAttribute('data-page');
      if (page === 'blog') initBlogPage();
      if (page === 'category') initCategoryPage();
      if (page === 'home') initHomeFeatured();
      if (page === 'contact') initContactForm();
    });
  });

  function sectionOf(cat) {
    var s = cat && cat.section;
    return s ? String(s).toLowerCase() : 'general';
  }

  function renderCategoryLinks(cats) {
    return cats
      .map(function (c) {
        return (
          '<li><a data-nav-link href="category.html?slug=' +
          encodeURIComponent(c.slug) +
          '">' +
          escapeHtml(c.name) +
          '</a></li>'
        );
      })
      .join('');
  }

  /** Fills Tutorials / Preparation / All categories from GET /api/categories (uses each category’s section). */
  function populateSidebarFromApi() {
    if (!window.BlogApi) return;
    var prepEl = document.querySelector('[data-section-list="preparation"]');
    var allEl = document.querySelector('[data-category-list]');
    if (!prepEl && !allEl) return;

    window.BlogApi
      .getCategories()
      .then(function (res) {
        var cats = res.data || [];
        function fill(el, list, emptyMsg) {
          if (!el) return;
          if (!list.length) {
            el.innerHTML = '<li class="muted">' + (emptyMsg || 'No topics yet.') + '</li>';
            return;
          }
          el.innerHTML = renderCategoryLinks(list);
        }
        fill(
          prepEl,
          cats.filter(function (c) {
            return sectionOf(c) === 'preparation';
          })
        );
        fill(allEl, cats, 'No categories yet.');
        highlightActiveNav();
      })
      .catch(function () {
        var err = '<li class="muted">Couldn’t load topics</li>';
        if (prepEl) prepEl.innerHTML = err;
        if (allEl) allEl.innerHTML = err;
      });
  }
})();
