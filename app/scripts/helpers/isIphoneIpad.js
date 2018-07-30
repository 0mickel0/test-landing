import $ from 'jquery';

if (navigator.userAgent.match(/(iPod|iPhone)/)) {
  $('body').addClass('iphone');
}
if (navigator.userAgent.match(/iPad/)) {
  $('body').addClass('ipad');
}
