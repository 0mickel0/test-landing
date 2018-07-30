import _Page from '../_Base';
import 'velocity-animate';
import {debounce} from 'lodash';
import {isMobile, isDesktop} from 'helpers/ScreenSize';
import Oscillators from './Oscillators.paper';
import WindowHelper from 'helpers/WindowHelper';
import 'fonts/LeagueGothic/LeagueGothic.css';
import 'fonts/Roboto/Roboto.css';
import template from './Index.jade';
import './Index.sass';

export default _Page.extend({
  template,
  className: 'p-index',

  ui: {
    oscillators: '[data-js-oscillators]',
    tagline: '[data-js-tagline]',
  },

  // protected:
  initialize() {
    this.onResizeThrottle = debounce(this.onResize, 50);
    WindowHelper.trackEvent('resize', this.onResizeThrottle, this);
    WindowHelper.trackEvent('mousemove', this.onMousemove, this);
    this.$window = $(window);
  },

  onShow() {
    const size = this._updateOscillatorsSize();
    this.oscillators = new Oscillators(this.ui.oscillators.get(0));
    this.oscillators.update(size);
    this.$el.addClass('__animated');
    this._animateTagline();
  },

  // private:
  _updateOscillatorsSize() {
    const width = this.$window.width() * 1.1;
    const height = this.$window.height();
    return {
      width,
      height,
    };
  },

  _animateTagline() {
    const delay = 2300;
    const duration = 975;
    const animParams = [381.47, 20.17];
    if (isMobile()) {
      this.ui.tagline.css({opacity: 0, top: 180});
      setTimeout(() => {
        this.ui.tagline.velocity({opacity: 1, top: 153}, duration, animParams);
      }, delay);
    } else {
      this.ui.tagline.css({opacity: 0, bottom: 180});
      setTimeout(() => {
        this.ui.tagline.velocity({opacity: 1, bottom: 229}, duration, animParams);
      }, delay);
    }
  },

  // handlers:
  onResize() {
    this.oscillators.clear();
    const size = this._updateOscillatorsSize();
    this.oscillators.update(size);
  },

  onMousemove(e) {
    if (isDesktop()) {
      this.oscillators.setX(e.clientX);
    }
  },
});
