(function () {
  function kkSkeletonCard() {
    return (
      '<div class="kk-skel">' +
      '<div class="kk-skel-badges"><div class="kk-skel-line"></div><div class="kk-skel-line"></div></div>' +
      '<div class="kk-skel-body">' +
      '<div class="kk-skel-art kk-skel-line"></div>' +
      '<div class="kk-skel-main"><div class="kk-skel-line"></div><div class="kk-skel-line"></div><div class="kk-skel-line"></div><div class="kk-skel-line"></div></div>' +
      '<div class="kk-skel-facts"><div class="kk-skel-line"></div><div class="kk-skel-line"></div></div>' +
      '<div class="kk-skel-cta"><div class="kk-skel-line"></div></div>' +
      '</div>' +
      '</div>'
    );
  }
  window.kkSkeletonHtml = function (count) {
    var n = count || 3;
    var html = '';
    for (var i = 0; i < n; i++) html += kkSkeletonCard();
    return html;
  };

  window.kkScrollToHash = function () {
    if (!window.location.hash) return;
    var id = window.location.hash.slice(1);
    var el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('cc-highlight');
    setTimeout(function () { el.classList.remove('cc-highlight'); }, 2500);
  };
})();
