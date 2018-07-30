{ getSize } = require '../functions'
{trackScreenSize} = require '../ScreenSize'

sizes = [
  name: 'big'
  width: 1400
,
  name: 'middle'
  width: 1000
,
  name: 'tablet'
  width: 640
,
  name: 'phone'
  width: 0
]

describe 'trackScreenSize', ->
  describe 'getSize', ->
    it 'if width is 1500 then return "big"', ->
      expect(getSize 1500, sizes).to.be.equal 'big'

    it 'if width is 1401 then return "big"', ->
      expect(getSize 1401, sizes).to.be.equal 'big'

    it 'if width is 1400 then return "middle"', ->
      expect(getSize 1400, sizes).to.be.equal 'middle'

    it 'if width is 1001 then return "middle"', ->
      expect(getSize 1001, sizes).to.be.equal 'middle'

    it 'if width is 1000 then return "tablet"', ->
      expect(getSize 1000, sizes).to.be.equal 'tablet'

    it 'if width is 641 then return "tablet"', ->
      expect(getSize 641, sizes).to.be.equal 'tablet'

    it 'if width is 640 then return "phone"', ->
      expect(getSize 640, sizes).to.be.equal 'phone'

    it 'if width is 1 then return "phone"', ->
      expect(getSize 1, sizes).to.be.equal 'phone'

    it 'if width is 0 then return "undefined"', ->
      expect(getSize 0, sizes).to.be.undefined

  describe 'trackScreenSize', ->
    it 'call trackScreenSize without callback trigger throw', ->
      expect(trackScreenSize).to.throw

    it 'call trackScreenSize with callback', (done) ->
      cb = (screen) ->
        expect(screen).to.be.string
        done()
      trackScreenSize cb


