/**
 * track.js — Track page: accordion of sections + numbered topic stepper.
 *
 * URL: track.html?group={groupSlug}
 *
 * Data flow:
 *   1. Read ?group= from the URL.
 *   2. GET /api/sidebar → find matching group.
 *   3. Render breadcrumb + one accordion item per topic.
 *   4. On first load, eagerly fetch content for the first open section.
 *   5. When a section is clicked open, lazy-fetch its posts + pages and
 *      render the numbered stepper. Results are cached to avoid refetches.
 *
 * Only activates when data-page="track".
 */
(function () {
  'use strict';

  /* Cached content per topic slug: { pages: [], posts: [] } */
  var _contentCache = {};

  /* Current group object (set after sidebar loads) */
  var _group = null;

  /* ------------------------------------------------------------------ */

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ------------------------------------------------------------------
     SVG: small document icon used on each section header
     ------------------------------------------------------------------ */
  var SECTION_ICON = (
    '<svg width="14" height="14" fill="none" viewBox="0 0 14 14" aria-hidden="true">' +
      '<rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3"/>' +
      '<path d="M4 5h6M4 7.5h6M4 10h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' +
    '</svg>'
  );

  /* Chevron (down) */
  var CHEVRON_DOWN = (
    '<svg width="14" height="14" fill="none" viewBox="0 0 14 14" aria-hidden="true">' +
      '<path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>'
  );

  /* ------------------------------------------------------------------ */

  function renderBreadcrumb(groupName) {
    return (
      '<nav class="track-breadcrumb" aria-label="Breadcrumb">' +
        '<a href="index.html">← All tracks</a>' +
        '<span class="track-breadcrumb__sep" aria-hidden="true">/</span>' +
        '<span>' + escapeHtml(groupName) + '</span>' +
      '</nav>'
    );
  }

  /* Renders one accordion item (collapsed or expanded) */
  function renderAccordionItem(topic, index, isOpen) {
    return (
      '<div class="accordion-item' + (isOpen ? ' accordion-item--open' : '') + '" data-index="' + index + '">' +
        '<button class="accordion-header" type="button" aria-expanded="' + (isOpen ? 'true' : 'false') + '">' +
          '<span class="accordion-icon">' + SECTION_ICON + '</span>' +
          '<span class="accordion-title">' + escapeHtml(topic.name || '') + '</span>' +
          '<span class="accordion-pill js-count-pill">–</span>' +
          '<span class="accordion-chevron">' + CHEVRON_DOWN + '</span>' +
        '</button>' +
        '<div class="accordion-body"' + (isOpen ? '' : ' hidden') + '>' +
          '<p class="section-description js-section-desc">Loading…</p>' +
          '<div class="topic-stepper js-stepper"></div>' +
        '</div>' +
      '</div>'
    );
  }

  /* Renders a single stepper row */
  function renderStepperItem(num, title, subtitle, href, isLast) {
    return (
      '<div class="stepper-item">' +
        '<div class="stepper-track">' +
          '<div class="stepper-dot">' + num + '</div>' +
          (isLast ? '' : '<div class="stepper-line"></div>') +
        '</div>' +
        '<div class="stepper-content">' +
          '<a class="stepper-title" href="' + escapeHtml(href) + '">' +
            escapeHtml(title) +
            '<span class="stepper-arrow" aria-hidden="true"> →</span>' +
          '</a>' +
          (subtitle ? '<p class="stepper-subtitle">' + escapeHtml(subtitle) + '</p>' : '') +
        '</div>' +
      '</div>'
    );
  }

  /* ------------------------------------------------------------------
     Content loading — fetches posts + pages for a topic, then fills
     the pill, description, and stepper inside the accordion item.
     ------------------------------------------------------------------ */
  function fillItemContent(itemEl, topic, groupSlug) {
    var slug = topic.slug || '';

    if (_contentCache[slug]) {
      applyContent(itemEl, _contentCache[slug], topic, groupSlug);
      return;
    }

    /* Fetch pages and posts in parallel; failures fall back to empty arrays */
    Promise.all([
      window.BlogApi.listCmsPages({ topicSlug: slug }).catch(function () { return { data: [] }; }),
      window.BlogApi.getPosts({ topicSlug: slug, limit: 50 }).catch(function () { return { data: [] }; }),
    ]).then(function (results) {
      var data = {
        pages: (results[0] && results[0].data) || [],
        posts: (results[1] && results[1].data) || [],
      };
      _contentCache[slug] = data;
      applyContent(itemEl, data, topic, groupSlug);
    }).catch(function () {
      var descEl = itemEl.querySelector('.js-section-desc');
      if (descEl) descEl.textContent = 'Could not load this section.';
    });
  }

  /* Writes pill count, description, and stepper into a ready accordion item */
  function applyContent(itemEl, data, topic, groupSlug) {
    /* Merge pages first, then posts — adjust order here if needed */
    var allItems = [].concat(
      (data.pages || []).map(function (p) { return { kind: 'page', item: p }; }),
      (data.posts || []).map(function (p) { return { kind: 'post', item: p }; })
    );

    /* Pill */
    var countPill = itemEl.querySelector('.js-count-pill');
    if (countPill) {
      countPill.textContent = allItems.length + (allItems.length === 1 ? ' topic' : ' topics');
    }

    /* Section description */
    var descEl = itemEl.querySelector('.js-section-desc');
    if (descEl) {
      if (allItems.length) {
        descEl.textContent =
          'Follow ' + allItems.length + ' topic' +
          (allItems.length === 1 ? '' : 's') +
          ' in ' + (topic.name || 'this section') + ', from basics to advanced.';
      } else {
        descEl.textContent = 'No articles have been added to this section yet.';
      }
    }

    /* Stepper */
    var stepperEl = itemEl.querySelector('.js-stepper');
    if (!stepperEl) return;

    if (!allItems.length) {
      stepperEl.innerHTML = '';
      return;
    }

    stepperEl.innerHTML = allItems.map(function (entry, i) {
      var isLast = i === allItems.length - 1;
      var href = buildArticleUrl(groupSlug, topic.slug || '', entry);

      /* Prefer an explicit excerpt; fall back to stripping HTML from content */
      var rawExcerpt = entry.item.excerpt ||
        String(entry.item.content || '').replace(/<[^>]+>/g, '').trim();
      var excerpt = rawExcerpt.length > 100
        ? rawExcerpt.slice(0, 97) + '…'
        : rawExcerpt;

      return renderStepperItem(
        i + 1,
        entry.item.title || '(untitled)',
        excerpt,
        href,
        isLast
      );
    }).join('');
  }

  /* Build article URL using StsRoutes if available, or fall back to query params */
  function buildArticleUrl(groupSlug, topicSlug, entry) {
    if (window.StsRoutes && typeof window.StsRoutes.articleUrl === 'function') {
      return window.StsRoutes.articleUrl(groupSlug, topicSlug, entry.item.slug, entry.kind);
    }
    /* Query-param fallback */
    return entry.kind === 'page'
      ? 'page.html?slug=' + encodeURIComponent(entry.item.slug || '')
      : 'post.html?slug=' + encodeURIComponent(entry.item.slug || '');
  }

  /* ------------------------------------------------------------------
     Accordion toggle — only one section open at a time.
     Clicking an open section closes it (toggle behaviour).
     ------------------------------------------------------------------ */
  function handleAccordionClick(accordion, clickedIndex, topics, groupSlug) {
    var items = accordion.querySelectorAll('.accordion-item');

    items.forEach(function (item) {
      var idx = parseInt(item.getAttribute('data-index'), 10);
      var body = item.querySelector('.accordion-body');
      var btn  = item.querySelector('.accordion-header');

      if (idx === clickedIndex) {
        var wasOpen = item.classList.contains('accordion-item--open');
        var nowOpen = !wasOpen;

        item.classList.toggle('accordion-item--open', nowOpen);
        if (btn)  btn.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
        if (body) body.hidden = !nowOpen;

        if (nowOpen && topics[idx]) {
          fillItemContent(item, topics[idx], groupSlug);
        }
      } else {
        item.classList.remove('accordion-item--open');
        if (btn)  btn.setAttribute('aria-expanded', 'false');
        if (body) body.hidden = true;
      }
    });
  }

  /* ------------------------------------------------------------------
     Page render — called once the group is loaded from the API
     ------------------------------------------------------------------ */
  function renderTrackPage(root, group) {
    var topics    = group.topics || [];
    var groupSlug = group.slug   || '';

    document.title = (group.name || 'Track') + ' — Switch To Salesforce';

    var html = renderBreadcrumb(group.name || 'Track');
    html += '<div class="track-accordion" id="js-track-accordion">';
    topics.forEach(function (topic, i) {
      html += renderAccordionItem(topic, i, i === 0);
    });
    html += '</div>';

    root.innerHTML = html;

    var accordion = document.getElementById('js-track-accordion');
    if (!accordion) return;

    /* Wire click handlers */
    accordion.querySelectorAll('.accordion-header').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.accordion-item');
        var idx  = parseInt(item.getAttribute('data-index'), 10);
        handleAccordionClick(accordion, idx, topics, groupSlug);
      });
    });

    /* Eagerly load first section */
    if (topics.length > 0) {
      var firstItem = accordion.querySelector('.accordion-item[data-index="0"]');
      if (firstItem) fillItemContent(firstItem, topics[0], groupSlug);
    }
  }

  /* ------------------------------------------------------------------
     Entry point
     ------------------------------------------------------------------ */
  function init() {
    var root = document.getElementById('track-root');
    if (!root || !window.BlogApi) return;

    var params    = new URLSearchParams(window.location.search);
    var groupSlug = (params.get('group') || '').trim();

    if (!groupSlug) {
      root.innerHTML = '<p class="muted" style="padding-top:1rem">No track selected. <a href="index.html">← Back to all tracks</a></p>';
      return;
    }

    window.BlogApi.getSidebar()
      .then(function (res) {
        var groups = (res && res.data) || [];
        var group  = null;

        for (var i = 0; i < groups.length; i++) {
          if (groups[i].slug === groupSlug) { group = groups[i]; break; }
        }

        if (!group) {
          root.innerHTML = '<p class="muted" style="padding-top:1rem">Track not found. <a href="index.html">← All tracks</a></p>';
          return;
        }

        _group = group;
        renderTrackPage(root, group);
      })
      .catch(function () {
        root.innerHTML = '<p class="error" style="padding-top:1rem">Could not load this track. Please try again.</p>';
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.getAttribute('data-page') === 'track') {
      init();
    }
  });
})();
