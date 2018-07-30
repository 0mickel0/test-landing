_ = require 'lodash'

getSize = (screenWidth, sizes) ->
  size = _.find sizes, ({width}) ->
    screenWidth > width
  size?.name

module.exports = {getSize}


