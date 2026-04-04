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

  function setMetaTags(seo, fallbackTitle) {
    if (seo && seo.meta) {
      document.title = seo.meta.title || fallbackTitle || 'Switch To Salesforce';
      var m = seo.meta;
      setMeta('name', 'description', m.description);
      setMeta('link', 'canonical', m.canonical, true);
    }
    if (seo && seo.openGraph) {
      var og = seo.openGraph;
      setMeta('property', 'og:title', og.title);
      setMeta('property', 'og:description', og.description);
      setMeta('property', 'og:url', og.url);
      setMeta('property', 'og:type', og.type || 'article');
      if (og.image && og.image[0] && og.image[0].url) {
        setMeta('property', 'og:image', og.image[0].url);
      }
    }
  }

  function setMeta(attrName, key, value, isLink) {
    if (!value) return;
    if (isLink) {
      var link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', value);
      return;
    }
    var sel = 'meta[' + attrName + '="' + key + '"]';
    var el = document.querySelector(sel);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  }

  function initReadingProgress() {
    var bar = document.getElementById('reading-progress');
    var article = document.getElementById('article-body');
    if (!bar || !article) return;
    function onScroll() {
      var rect = article.getBoundingClientRect();
      var total = article.offsetHeight - window.innerHeight;
      var scrolled = Math.min(Math.max(-rect.top, 0), total);
      var pct = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = Math.min(100, pct) + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function wrapCodeBlocks(root) {
    root.querySelectorAll('pre code').forEach(function (code) {
      var pre = code.parentElement;
      if (pre.querySelector('.code-copy-btn')) return;
      pre.classList.add('code-block');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function () {
        var text = code.innerText;
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = 'Copied';
          setTimeout(function () {
            btn.textContent = 'Copy';
          }, 2000);
        });
      });
      pre.appendChild(btn);
    });
  }

  function highlightCode(root) {
    if (window.Prism) {
      window.Prism.highlightAllUnder(root);
    }
  }

  function renderRelated(container, posts) {
    if (!container) return;
    if (!posts || !posts.length) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML =
      '<h2 class="section-title">Related posts</h2><div class="related-grid">' +
      posts
        .map(function (p) {
          return (
            '<a class="related-card" href="post.html?slug=' +
            encodeURIComponent(p.slug) +
            '">' +
            '<span class="related-card__title">' +
            escapeHtml(p.title) +
            '</span>' +
            '</a>'
          );
        })
        .join('') +
      '</div>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get('slug');
    if (!slug) {
      var segs = window.location.pathname.replace(/^\//, '').split('/').filter(Boolean);
      if (segs.length === 3 && !/\.html$/i.test(segs[2])) {
        slug = decodeURIComponent(segs[2]);
      }
    }
    var root = document.getElementById('post-root');
    if (!slug || !root) return;

    root.innerHTML = '<p class="muted">Loading article…</p>';

    window.BlogApi
      .getPost(slug)
      .then(function (res) {
        var post = res.data;
        var seo = res.seo;
        var related = res.relatedPosts || [];

        setMetaTags(seo, post.title);

        var cat = post.category && post.category.name ? post.category.name : '';
        var catSlug = post.category && post.category.slug ? post.category.slug : '';
        var date = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '';
        var cover = post.coverImage ? absoluteUploadUrl(post.coverImage) : '';

        var breadcrumb =
          '<nav class="breadcrumb" aria-label="Breadcrumb">' +
          '<a href="index.html">Home</a>' +
          '<span class="breadcrumb__sep">/</span>' +
          '<a href="blog.html">Articles</a>' +
          (catSlug
            ? '<span class="breadcrumb__sep">/</span><a href="category.html?slug=' +
              encodeURIComponent(catSlug) +
              '">' +
              escapeHtml(cat) +
              '</a>'
            : '') +
          '<span class="breadcrumb__sep">/</span>' +
          '<span aria-current="page">' +
          escapeHtml(post.title) +
          '</span>' +
          '</nav>';

        var tags =
          post.tags && post.tags.length
            ? '<div class="tag-list">' +
              post.tags
                .map(function (t) {
                  return '<span class="tag">' + escapeHtml(t) + '</span>';
                })
                .join('') +
              '</div>'
            : '';

        root.innerHTML =
          breadcrumb +
          '<header class="article-header">' +
          (cover ? '<div class="article-cover"><img src="' + escapeHtml(cover) + '" alt=""/></div>' : '') +
          '<h1 class="article-title">' +
          escapeHtml(post.title) +
          '</h1>' +
          '<div class="article-meta">' +
          '<span class="article-meta__author">By ' +
          escapeHtml(post.author) +
          '</span>' +
          '<span class="article-meta__date">' +
          escapeHtml(date) +
          '</span>' +
          '<span class="article-meta__time">' +
          (post.readingTimeMinutes || 1) +
          ' min read</span>' +
          '</div>' +
          '</header>' +
          '<article id="article-body" class="article-body prose">' +
          post.content +
          '</article>' +
          tags +
          '<section id="related-posts" class="related-section"></section>' +
          '<section class="comments-section">' +
          '<h2 class="section-title">Comments</h2>' +
          '<form id="comment-form" class="form">' +
          '<input type="hidden" name="postId" value="' +
          escapeHtml(post._id) +
          '"/>' +
          '<label>Name<input name="name" required maxlength="120"/></label>' +
          '<label>Email<input name="email" type="email" required/></label>' +
          '<label>Comment<textarea name="comment" required rows="4" maxlength="5000"></textarea></label>' +
          '<button type="submit" class="btn btn--primary">Post comment</button>' +
          '<p id="comment-msg" class="form-msg" role="status"></p>' +
          '</form>' +
          '</section>';

        var articleEl = document.getElementById('article-body');
        wrapCodeBlocks(articleEl);
        highlightCode(articleEl);

        renderRelated(document.getElementById('related-posts'), related);

        var form = document.getElementById('comment-form');
        var msg = document.getElementById('comment-msg');
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var fd = new FormData(form);
          window.BlogApi
            .postComment({
              postId: fd.get('postId'),
              name: fd.get('name'),
              email: fd.get('email'),
              comment: fd.get('comment'),
            })
            .then(function () {
              if (msg) {
                msg.textContent = 'Thanks — your comment was submitted.';
                msg.className = 'form-msg success';
              }
              form.reset();
            })
            .catch(function () {
              if (msg) {
                msg.textContent = 'Could not submit comment.';
                msg.className = 'form-msg error';
              }
            });
        });

        initReadingProgress();
      })
      .catch(function () {
        root.innerHTML = '<p class="error">Post not found or API unavailable.</p>';
      });
  });
})();
