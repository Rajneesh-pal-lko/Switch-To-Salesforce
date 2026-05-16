/**
 * tracks.js — Homepage track selection screen.
 * Fetches groups from GET /api/sidebar and renders one clickable card per group.
 * Only active when data-page="tracks" (index.html).
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Pill labels shown on the first four tracks (index-based).
     Set to null to hide the pill for that position.
     ------------------------------------------------------------------ */
  var PILLS = ['Start here', 'Most popular', null, 'Advanced'];

  /* ------------------------------------------------------------------
     SVG icons — one per colour-index slot (wraps after 8).
     ------------------------------------------------------------------ */
  var ICONS = [
    /* 0 — Admin: shield */
    '<svg width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 2.5 4v3.5C2.5 11 5 13 8 14c3-1 5.5-3 5.5-6.5V4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    /* 1 — Developer: code brackets */
    '<svg width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 4.5 1.5 8 5 11.5M11 4.5 14.5 8 11 11.5M9.5 3l-3 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    /* 2 — Fresher: star */
    '<svg width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 9.8 6.4H15l-4.2 3.1 1.6 4.9L8 11.5l-4.4 2.9 1.6-4.9L1 6.4h5.2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    /* 3 — Experienced: briefcase */
    '<svg width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="5.5" width="13" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 5.5V4A1.5 1.5 0 0 1 7 2.5h2A1.5 1.5 0 0 1 10.5 4v1.5" stroke="currentColor" stroke-width="1.5"/><path d="M1.5 9.5h13" stroke="currentColor" stroke-width="1"/></svg>',
    /* 4 — extra: lightbulb */
    '<svg width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2a4 4 0 0 1 2.83 6.83V10H5.17V8.83A4 4 0 0 1 8 2ZM5.5 10.5h5M6 12.5h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    /* 5 — extra: bar chart */
    '<svg width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 13.5h13M4 10V7M8 10V4M12 10V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    /* 6 — extra: layers */
    '<svg width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 14.5 5 8 8.5 1.5 5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M1.5 9.5 8 13l6.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    /* 7 — extra: target */
    '<svg width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="8" r="3.5" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="8" r="1" fill="currentColor"/></svg>',
  ];

  /* Right-chevron SVG used on every card */
  var CHEVRON = '<svg width="14" height="14" fill="none" viewBox="0 0 14 14" aria-hidden="true"><path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ------------------------------------------------------------------ */

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderTrackCard(group, index) {
    var href = 'track.html?group=' + encodeURIComponent(group.slug || '');
    var topicCount = (group.topics || []).length;
    var subtitle = topicCount === 1 ? '1 section' : topicCount + ' sections';
    var pill = index < PILLS.length ? PILLS[index] : null;
    var icon = ICONS[index % ICONS.length];
    var ci = String(index % 8); /* colour index — matches track.css data-ci */

    return (
      '<a class="track-card" href="' + escapeHtml(href) + '">' +
        '<span class="track-card__icon" data-ci="' + ci + '">' + icon + '</span>' +
        '<span class="track-card__body">' +
          '<span class="track-card__title">' + escapeHtml(group.name || '') + '</span>' +
          '<span class="track-card__subtitle">' + escapeHtml(subtitle) + '</span>' +
        '</span>' +
        (pill ? '<span class="track-card__pill">' + escapeHtml(pill) + '</span>' : '') +
        '<span class="track-card__chevron">' + CHEVRON + '</span>' +
      '</a>'
    );
  }

  function init() {
    var container = document.getElementById('tracks-list');
    if (!container || !window.BlogApi) return;

    window.BlogApi.getSidebar()
      .then(function (res) {
        var groups = (res && res.data) || [];
        if (!groups.length) {
          container.innerHTML = '<p class="muted">No learning tracks are available yet. Add sidebar groups in the admin dashboard.</p>';
          return;
        }
        container.innerHTML = groups
          .map(function (group, i) { return renderTrackCard(group, i); })
          .join('');
      })
      .catch(function () {
        container.innerHTML = '<p class="error">Could not load learning tracks. Please check your connection and try again.</p>';
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.getAttribute('data-page') === 'tracks') {
      init();
    }
  });
})();
