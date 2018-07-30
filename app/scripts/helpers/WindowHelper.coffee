$ = require 'jquery'
_ = require 'lodash'

MODULE_NAME = 'WindowHelper'

$window = $(window)

module.exports =
  #public:
  trackEvent: (event, callback, scope = null) ->
    @_checkCallbackError event, callback
    id = _.uniqueId MODULE_NAME
    eventString = "#{event}.#{id}"
    $window.on eventString , _.bind callback, scope
    -> $window.off eventString

  getWidth: ->
    $window.width()

  getHeight: ->
    $window.height()

  #private:
  _checkCallbackError: (event, callback) ->
    msg = "#{MODULE_NAME}: track event #{event} requires a callback"
    if not callback then throw new Error msg
