WindowHelper = require 'helpers/WindowHelper'
_ = require 'lodash'
_sizes = require './defaultSizes'
{ getSize } = require './functions'

MODULE_NAME = 'ScreenSize'

_doNotTrackResize = null
_size = null
_height = null
_prevSize = null
_prevHeight = null
_callbacks = []

checkCallbackError = (callback) ->
  msg = "#{MODULE_NAME} requires a callback"
  if not callback then throw new Error msg

updateSize = ->
  _prevHeight = _height
  _prevSize = _size
  width = WindowHelper.getWidth()
  _height = WindowHelper.getHeight()
  _size = getSize width, _sizes

reportChanges = () ->
  if _prevSize isnt _size || _prevHeight isnt _height
    _.invoke _callbacks, 'call', null, _size

onWidthChange = ->
  updateSize()
  reportChanges()

onResize = ->
  updateSize()
  reportChanges(false)

checkTrackResize = ->
  if _callbacks.length and not _doNotTrackResize
    _doNotTrackResize = WindowHelper.trackEvent 'resize', onWidthChange
    updateSize()
  else if not _callbacks.length and _doNotTrackResize
    _doNotTrackResize()
    _doNotTrackResize = null

trackScreenSize = (callback, scope = null) ->
  checkCallbackError callback
  bindCallback = callback.bind scope
  _callbacks.push bindCallback
  checkTrackResize()
  bindCallback _size
  ->
    _callbacks = _.without _callbacks, bindCallback
    checkTrackResize()

getScreenSize = ->
  updateSize() if not _doNotTrackResize
  _size

isSize = (size) ->
  getScreenSize() is size

isMobile = ->
  isSize 'mobile'

isTablet = ->
  isSize 'tablet'

isDesktop = ->
  isSize 'desktop'

module.exports = {trackScreenSize, getScreenSize, isMobile, isTablet, isDesktop}
