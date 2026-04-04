/**
 * Shared TinyMCE (CDN) setup for articles and blog posts.
 * Depends on: tinymce global, AdminApi (token), optional AdminData.listMedia.
 */
(function (global) {
  function apiOrigin() {
    var o =
      global.STS_API_ORIGIN ||
      global.BLOG_API_ORIGIN ||
      'http://localhost:5050';
    return String(o).replace(/\/$/, '');
  }

  function absolutizeUploads(html) {
    if (!html) return '';
    var o = apiOrigin();
    return String(html).replace(/src="\/uploads\//g, 'src="' + o + '/uploads/');
  }

  function relativizeUploads(html) {
    if (!html) return '';
    var o = apiOrigin().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return String(html).replace(new RegExp('src="' + o + '/uploads/', 'g'), 'src="/uploads/');
  }

  function ensureMediaModal() {
    var id = 'sts-media-modal';
    var el = document.getElementById(id);
    if (el) return el;
    el = document.createElement('div');
    el.id = id;
    el.className = 'sts-media-modal';
    el.setAttribute('hidden', '');
    el.innerHTML =
      '<div class="sts-media-modal__backdrop" data-close></div>' +
      '<div class="sts-media-modal__panel" role="dialog" aria-modal="true" aria-label="Media library">' +
      '<div class="sts-media-modal__head">' +
      '<h2 class="sts-media-modal__title">Recent uploads</h2>' +
      '<button type="button" class="admin-btn admin-btn--ghost" data-close>Close</button>' +
      '</div>' +
      '<div class="sts-media-modal__body" id="sts-media-modal-list"><p class="muted">Loading…</p></div>' +
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('click', function (e) {
      if (e.target && e.target.getAttribute('data-close') != null) {
        el.setAttribute('hidden', '');
      }
    });
    return el;
  }

  function openMediaPicker(insertUrl) {
    var modal = ensureMediaModal();
    var listEl = document.getElementById('sts-media-modal-list');
    modal.removeAttribute('hidden');
    listEl.innerHTML = '<p class="muted">Loading…</p>';

    var done = function (items) {
      if (!items || !items.length) {
        listEl.innerHTML = '<p class="muted">No images yet. Upload from the image dialog or POST /api/admin/media.</p>';
        return;
      }
      listEl.innerHTML =
        '<ul class="sts-media-grid">' +
        items
          .map(function (it) {
            var abs = apiOrigin() + it.url;
            var safe = abs.replace(/"/g, '&quot;');
            return (
              '<li><button type="button" class="sts-media-thumb" data-url="' +
              safe +
              '">' +
              '<img src="' +
              safe +
              '" alt="" loading="lazy"/>' +
              '<span class="sts-media-thumb__name">' +
              (it.filename || '').replace(/</g, '&lt;') +
              '</span></button></li>'
            );
          })
          .join('') +
        '</ul>';
      listEl.querySelectorAll('[data-url]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          insertUrl(btn.getAttribute('data-url'));
          modal.setAttribute('hidden', '');
        });
      });
    };

    if (global.AdminData && typeof global.AdminData.listMedia === 'function') {
      global.AdminData.listMedia().then(done).catch(function () {
        listEl.innerHTML = '<p class="admin-msg admin-msg--error">Could not load media.</p>';
      });
    } else {
      global
        .fetch(apiOrigin() + '/api/admin/media', {
          headers: global.AdminApi.authHeaders(true),
        })
        .then(function (r) {
          return r.json();
        })
        .then(function (res) {
          done(res.data || []);
        })
        .catch(function () {
          listEl.innerHTML = '<p class="admin-msg admin-msg--error">Could not load media.</p>';
        });
    }
  }

  function init(opts) {
    opts = opts || {};
    var fieldId = opts.fieldId || 'field-content';
    var selector = '#' + fieldId;
    var ta = document.getElementById(fieldId);
    if (!ta || !global.tinymce) return;

    var token = global.AdminApi && global.AdminApi.getToken ? global.AdminApi.getToken() : '';

    function uploadHandler(blobInfo, progress) {
      return new Promise(function (resolve, reject) {
        var fd = new FormData();
        fd.append('file', blobInfo.blob(), blobInfo.filename());
        global
          .fetch(apiOrigin() + '/api/admin/media', {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + token },
            body: fd,
          })
          .then(function (r) {
            return r.json().then(function (body) {
              if (!r.ok) throw new Error(body.message || r.statusText);
              return body;
            });
          })
          .then(function (body) {
            resolve(body.absoluteUrl || apiOrigin() + body.url);
          })
          .catch(reject);
      });
    }

    global.tinymce.init({
      selector: selector,
      height: opts.height || 520,
      menubar: false,
      branding: false,
      promotion: false,
      license_key: 'gpl',
      base_url: 'https://cdn.jsdelivr.net/npm/tinymce@6',
      suffix: '.min',
      plugins: 'lists link image codesample autoresize paste autolink',
      toolbar:
        'blocks | bold italic underline | link | bullist numlist | blockquote hr | codesample | code | medialibrary',
      block_formats: 'Paragraph=p; Heading 2=h2; Heading 3=h3; Heading 4=h4',
      extended_valid_elements: 'u',
      formats: {
        underline: { inline: 'u', exact: true },
      },
      paste_merge_formats: true,
      relative_urls: false,
      document_base_url: apiOrigin() + '/',
      images_upload_handler: uploadHandler,
      automatic_uploads: true,
      setup: function (editor) {
        editor.ui.registry.addButton('medialibrary', {
          text: 'Library',
          tooltip: 'Insert from media library',
          onAction: function () {
            openMediaPicker(function (url) {
              editor.insertContent('<p><img src="' + url + '" alt="" loading="lazy" /></p>');
            });
          },
        });
      },
      init_instance_callback: function (editor) {
        var raw = ta.value || '';
        editor.setContent(absolutizeUploads(raw));
        if (typeof opts.onReady === 'function') {
          opts.onReady(editor);
        }
      },
    });
  }

  function getContent(fieldId) {
    var ed = global.tinymce.get(fieldId);
    var html = ed ? ed.getContent() : (document.getElementById(fieldId) || {}).value || '';
    return relativizeUploads(html);
  }

  global.StsTinyMce = {
    init: init,
    getContent: getContent,
    absolutizeUploads: absolutizeUploads,
    relativizeUploads: relativizeUploads,
  };
})(window);
