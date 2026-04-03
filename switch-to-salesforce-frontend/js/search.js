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
    var origin = window.BlogApi.API_ORIGIN;
    return origin + (path.charAt(0) === '/' ? path : '/' + path);
  }

  function renderResults(container, posts) {
    if (!posts || !posts.length) {
      container.innerHTML = '<p class="muted">No results. Try different keywords.</p>';
      return;
    }
    container.innerHTML = posts
      .map(function (p) {
        var cat = p.category && p.category.name ? p.category.name : '';
        var excerpt = p.excerpt || String(p.content || '').replace(/<[^>]+>/g, '').slice(0, 200);
        var cover = p.coverImage ? absoluteUploadUrl(p.coverImage) : '';
        return (
          '<article class="blog-card blog-card--compact">' +
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
          '…</p>' +
          '<a class="btn btn--ghost blog-card__cta" href="post.html?slug=' +
          encodeURIComponent(p.slug) +
          '">Read more</a>' +
          '</div></article>'
        );
      })
      .join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('search-form');
    var input = document.getElementById('search-input');
    var out = document.getElementById('search-results');
    if (!form || !input || !out) return;

    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) {
      input.value = params.get('q');
      runSearch(params.get('q'));
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value.trim();
      var url = new URL(window.location.href);
      if (q) url.searchParams.set('q', q);
      else url.searchParams.delete('q');
      window.history.replaceState({}, '', url);
      runSearch(q);
    });

    function runSearch(q) {
      if (!q) {
        out.innerHTML = '<p class="muted">Enter a search query.</p>';
        return;
      }
      out.innerHTML = '<p class="muted">Searching…</p>';
      window.BlogApi
        .getPosts({ q: q, limit: 20, page: 1 })
        .then(function (res) {
          renderResults(out, res.data);
        })
        .catch(function () {
          out.innerHTML = '<p class="error">Search failed. Is the API running?</p>';
        });
    }
  });
})();
