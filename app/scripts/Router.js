import Backbone from 'backbone';
import Middleware from 'sp-utils-middleware';
import common from './common';

import IndexPage from 'page/Index';

function showPage(View, options = {}, callback) {
  return common.app.layout.setContent(View, options, callback);
}

class MiddlewareRouter extends Middleware {
  auth(async) {
    return async.resolve('auth');
  }
}

const middleware = new MiddlewareRouter();

const Router = Backbone.Router.extend({

  routes:
    {'': 'index',
    '*default': 'defaultRouter',
    },

  index: middleware.wrap(() =>
    showPage(IndexPage)
  ),

  defaultRouter() {
    return this.navigate('', {trigger: true, replace: true});
  },
});

export default Router;
