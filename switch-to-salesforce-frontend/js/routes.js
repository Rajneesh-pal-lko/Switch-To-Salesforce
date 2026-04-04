/**
 * Slug-based URLs for the static site. Pretty paths work when vercel.json rewrites are deployed;
 * query-string URLs always work on local static servers.
 */
(function (global) {
  function topicPath(groupSlug, topicSlug) {
    return '/' + encodeURIComponent(groupSlug) + '/' + encodeURIComponent(topicSlug);
  }

  function articlePath(groupSlug, topicSlug, articleSlug) {
    return (
      '/' +
      encodeURIComponent(groupSlug) +
      '/' +
      encodeURIComponent(topicSlug) +
      '/' +
      encodeURIComponent(articleSlug)
    );
  }

  /** Topic landing page (lists articles under that sidebar topic). */
  function topicUrl(groupSlug, topicSlug) {
    return 'topic.html?group=' + encodeURIComponent(groupSlug) + '&topic=' + encodeURIComponent(topicSlug);
  }

  /**
   * Article URL: blog post vs CMS page.
   * @param {'post'|'page'} kind
   */
  function articleUrl(groupSlug, topicSlug, articleSlug, kind) {
    var g = groupSlug ? encodeURIComponent(groupSlug) : '';
    var t = topicSlug ? encodeURIComponent(topicSlug) : '';
    var s = encodeURIComponent(articleSlug);
    var base = kind === 'page' ? 'page.html' : 'post.html';
    var q = 'slug=' + s;
    if (g && t) {
      q += '&group=' + g + '&topic=' + t;
    }
    return base + '?' + q;
  }

  global.StsRoutes = {
    topicPath: topicPath,
    articlePath: articlePath,
    topicUrl: topicUrl,
    articleUrl: articleUrl,
  };
})(typeof window !== 'undefined' ? window : this);
