/**
 * Shared admin chrome: sidebar navigation, mobile toggle, logout, active state.
 * Call AdminUi.bootstrap({ active: 'dashboard' }) after DOM ready on each page.
 */
(function () {
  var PAGES = [
    { id: 'dashboard', href: 'dashboard.html', label: 'Dashboard', section: null },
    { id: 'groups', href: 'groups.html', label: 'Groups', section: 'content' },
    { id: 'topics', href: 'topics.html', label: 'Topics', section: 'content' },
    { id: 'articles', href: 'articles.html', label: 'Articles', section: 'content' },
    { id: 'posts', href: 'posts.html', label: 'Blog posts', section: 'blog' },
    { id: 'categories', href: 'categories.html', label: 'Categories', section: 'blog' },
    { id: 'media', href: 'media.html', label: 'Media', section: 'media' },
  ];

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderSidebar(activeId) {
    var html =
      '<div class="admin-sidebar__inner">' +
      '<div class="admin-sidebar__brand">Switch To Salesforce</div>' +
      '<nav class="admin-sidebar__nav" aria-label="Admin navigation">' +
      '<p class="admin-sidebar__section">Main</p>' +
      '<a class="admin-sidebar__link' +
      (activeId === 'dashboard' ? ' is-active' : '') +
      '" href="dashboard.html">Dashboard</a>' +
      '<p class="admin-sidebar__section">Content management</p>';

    PAGES.forEach(function (p) {
      if (p.section !== 'content') return;
      html +=
        '<a class="admin-sidebar__link' +
        (activeId === p.id ? ' is-active' : '') +
        '" href="' +
        escapeHtml(p.href) +
        '">' +
        escapeHtml(p.label) +
        '</a>';
    });

    html += '<p class="admin-sidebar__section">Blog</p>';
    PAGES.forEach(function (p) {
      if (p.section !== 'blog') return;
      html +=
        '<a class="admin-sidebar__link' +
        (activeId === p.id ? ' is-active' : '') +
        '" href="' +
        escapeHtml(p.href) +
        '">' +
        escapeHtml(p.label) +
        '</a>';
    });

    html += '<p class="admin-sidebar__section">Media</p>';
    PAGES.forEach(function (p) {
      if (p.section !== 'media') return;
      html +=
        '<a class="admin-sidebar__link' +
        (activeId === p.id ? ' is-active' : '') +
        '" href="' +
        escapeHtml(p.href) +
        '">' +
        escapeHtml(p.label) +
        '</a>';
    });

    html +=
      '<p class="admin-sidebar__section">Account</p>' +
      '<a class="admin-sidebar__link" href="#" id="admin-logout">Log out</a>' +
      '</nav>' +
      '</div>';
    return html;
  }

  function bootstrap(options) {
    if (!window.AdminApi || !AdminApi.requireAuth()) return;
    var active = (options && options.active) || 'dashboard';
    var aside = document.getElementById('admin-sidebar');
    if (aside) {
      aside.innerHTML = renderSidebar(active);
    }

    var logout = document.getElementById('admin-logout');
    if (logout) {
      logout.addEventListener('click', function (e) {
        e.preventDefault();
        AdminApi.clearToken();
        window.location.href = 'login.html';
      });
    }

    var toggle = document.getElementById('admin-sidebar-toggle');
    var app = document.querySelector('.admin-app');
    if (toggle && app) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        app.classList.toggle('admin-app--sidebar-open');
      });
    }
  }

  window.AdminUi = {
    bootstrap: bootstrap,
  };
})();
