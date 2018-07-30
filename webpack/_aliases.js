const path = require('path');

module.exports = {
  'styles': path.join(__dirname, '../app/styles'),
  'images': path.join(__dirname, '../app/images'),
  'files': path.join(__dirname, '../app/files'),
  'fonts': path.join(__dirname, '../app/fonts'),
  'data': path.join(__dirname, '../app/scripts/data'),
  'helpers': path.join(__dirname, '../app/scripts/helpers'),
  'utils': path.join(__dirname, '../app/scripts/utils'),
  'common': path.join(__dirname, '../app/scripts/common'),
  'model': path.join(__dirname, '../app/scripts/model'),
  'collection': path.join(__dirname, '../app/scripts/collection'),
  'view': path.join(__dirname, '../app/scripts/view'),
  'component': path.join(__dirname, '../app/scripts/component'),
  'page': path.join(__dirname, '../app/scripts/page'),
  'preprocess': path.join(__dirname, '../app/scripts/preprocess'),
  'backbone-mixin': 'backbone-mixin/build/backbone-mixin',
  'epoxy': 'backbone.epoxy',
  'underscore': 'lodash',
  'paper': 'paper/dist/paper-full',
  'gyronorm': 'gyronorm/dist/gyronorm.complete',
};
