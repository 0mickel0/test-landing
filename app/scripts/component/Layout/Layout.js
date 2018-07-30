import _Base from '../_Base';

export default _Base.extend({
  regions: {
    content: '[data-view=content]',
  },

  initialize() {},

  setContent(View, options, callback) {
    return this.r.content.show(View, options, () => {
      const view = this.r.content.getViewDI(View);
      if (typeof callback === 'function') {
        return callback(view);
      }
    });
  },

  getModalLayout() {
    return this.r.modal;
  },
});
