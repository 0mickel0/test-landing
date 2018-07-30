import 'styles/main.sass';
import Backbone from 'backbone';
import Router from './Router';
import ServerApi from './ServerAPI';
import Layout from 'component/Layout';
import common from 'common';
import 'helpers/isIphoneIpad';
import {isIE} from 'helpers/isIE';
import GAConstructor from 'sp-utils-gaconstructor';
import preprocess from 'preprocess';

export default class Application {
  constructor(common) {
    common.router = new Router();
    common.api = new ServerApi();
    this.$document = $(document);
    this.initPushstateLinks();
    const ie = isIE();
    if (ie) {
      $('body').addClass(`ie-${ie}`);
    }
    // Init google analitics
    common.ga = new GAConstructor(preprocess.GA, Backbone, true);
  }

  start() {
    const layout = new Layout({el: '#layout'});
    layout.showCurrent();
    this.layout = layout;
    return Backbone.history.start(({
      pushState: Boolean(window.history && window.history.pushState),
    }));
  }

  initPushstateLinks() {
    const selector = 'a:not([data-link]):not([href^="javascript:"])';
    this.$document.on('click', selector, function (evt) {
      $('.dropdown.open').removeClass('open');
      if ($(this).parents('.pluso-box').length) {
        return;
      }
      const href = $(this).attr('href') || '';
      const protocol = `${this.protocol}//`;
      if (href.slice(0, protocol.length) !== protocol) {
        evt.preventDefault();
        common.router.navigate(href, true);
      }
    });
  }
}
