jQuery(document).ready(function () {
  jQuery('#cup_header nav a').each(function (i, e) {
    if (e.href === document.location.href) {
      jQuery(e).addClass('current');
    }
  });
});
