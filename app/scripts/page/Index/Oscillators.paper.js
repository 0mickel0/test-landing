import {isMobile, isDesktop} from 'helpers/ScreenSize';
import GyroNorm from 'gyronorm';
import paper from 'paper';
import freqData from 'files/gnossienne_2000';
import {max, forEach} from 'lodash';

// set scope
const Path = paper.Path;
const Point = paper.Point;
const Color = paper.Color;
const Group = paper.Group;

const colors = [{
  hue: 123,
  saturation: 0.9,
  brightness: 0.9,
}, {
  hue: 123,
  saturation: 0.8,
  brightness: 0.75,
}];

class Oscillators {
  // protected:
  constructor(canvas) {
    this.canvas = canvas;
    this.track = null;
    const amount = this.amount = 8;
    this.leftPathColor = '#fd9203';
    this.rightPathColor = '#fd2201';
    this.hueRange = [61, 257];
    this.baseGradientColors = [];
    this.gradientColors = [];
    forEach(colors, color => {
      this.baseGradientColors.push(new Color(color));
      this.gradientColors.push(new Color(color));
    });
    this.fftSize = Math.pow(2, amount) * 2; // Fast Fourier Transform size
    this.gainNode = null;
    this.source = null;
    this.currentIndex = 0;

    // audio
    this.audio = null;
    this.audioData = window.audioData = [];
    this.smoothingTimeConstant = 0.75;
    this.analyserL = null;
    this.analyserR = null;
    this.freqByteData = null;

    // gradient
    this.gradientWCurrKoeff = 0;

    // gyronorm
    this.gnArgs = {
      frequency: 10, // ( How often the object sends the values - milliseconds )
      gravityNormalized: true, // ( If the garvity related values to be normalized )
      orientationBase: GyroNorm.GAME, // ( Can be GyroNorm.GAME or GyroNorm.WORLD. gn.GAME returns orientation values with respect to the head direction of the device. gn.WORLD returns the orientation values with respect to the actual north direction of the world. )
      decimalCount: 1, // ( How many digits after the decimal point will there be in the return values )
      logger: null, // ( Function to be called to log messages from gyronorm.js )
      screenAdjusted: false, // ( If set to true it will return screen adjusted values. )
    };
    this.isGNAvaliable = false;
    this.gn = new GyroNorm();
    if (!isDesktop()) {
      this.gn.init(this.gnArgs).then(() => {
        const isAvailable = this.gn.isAvailable();
        this.isGNAvaliable = isAvailable.rotationRateAvailable;
        if (this.isGNAvaliable) {
          this.gn.start(data => {
            this.onDeviceRotate(data.dm.gx);
          });
        }
      });
    }

    paper.setup(this.canvas);
    this.view = paper.view;
    this._updateParams();
    this._createPaths();
    this._initPaths();
    this.view.onFrame = event => this.onFrame(event);
  }

  // public:
  setTrack(track) {
    this.track = track;
    this._handleAudio();
  }

  update(size) {
    this.gradientSpeed = isDesktop() ? 30 : 10;
    this.gradientDelta = isDesktop() ? 30 : 15;
    const view = this.view;
    view.viewSize.width = size.width;
    view.viewSize.height = size.height;
    this._updateParams();
    this._clearPaths();
    this._initPaths();
    this.view.play();
  }

  clear() {
    this.view.pause();
  }

  setX(x) {
    this.cursorPositionX = x;
  }
  // private:
  _updateParams() {
    const view = this.view;
    this.strokeWidth = isMobile() ? 16 : 30;
    this.step = view.size.width / this.amount;
    this.scale = isMobile() ? view.size.height / 3 : view.size.height / 1.75;

    this.cursorPositionX = view.center.x;
    this.currentGradientX = view.center.x;
    this.gradientWidth = isDesktop() ? 330 : view.size.width / 3.5;
    this.gradientCurrWidth = this.gradientWidth;
  }

  _createPaths() {
    this.leftPath = new Path({
      strokeColor: this.leftPathColor,
    });
    const stops = [this.rightPathColor];
    const gradientColorsCount = this.baseGradientColors.length;
    for (let i = gradientColorsCount - 1; i >= 0; i--) {
      stops.push(this.baseGradientColors[i]);
    }
    for (let i = 1; i < gradientColorsCount; i++) {
      stops.push(this.baseGradientColors[i]);
    }
    stops.push(this.rightPathColor);
    this.rightPath = new Path({
      strokeColor: {
        gradient: {
          stops,
        },
        origin: [(this.view.size.width - this.gradientWidth / 2), 0],
        destination: [(this.view.size.width + this.gradientWidth / 2), 0],
      },
    });
    this.group = new Group({
      children: [this.leftPath, this.rightPath],
      transformContent: false,
      strokeJoin: 'round',
      strokeCap: 'square',
      position: this.view.center,
    });
  }

  _initPaths() {
    for (let i = -1; i <= this.amount + 1; i++) {
      this.leftPath.add(new Point(i * this.step, 0));
      this.rightPath.add(new Point(i * this.step, 0));
    }
    this.group.strokeWidth = this.strokeWidth;
  }
  _clearPaths() {
    this.leftPath.removeSegments();
    this.rightPath.removeSegments();
  }
  _getEqualizerBands(data) {
    const bands = [];
    const amount = Math.sqrt(data.length) / 2;
    for (let i = 0; i < amount; i++) {
      const start = Math.pow(2, i) - 1;
      const end = start * 2 + 1;
      let sum = 0;
      for (let j = start; j < end; j++) {
        sum += data[j];
      }
      const avg = sum / (255 * (end - start));
      bands[i] = Math.sqrt(avg / Math.sqrt(2));
    }
    return bands;
  }

  _updatePaths() {
    const leftBands = freqData[this.currentIndex][0];
    const rightBands = freqData[this.currentIndex][1];

    this.gradientKoeff = max(rightBands);

    for (let i = 1; i <= this.amount; i++) {
      this.leftPath.segments[i].point = [i * this.step, (-leftBands[i - 1]) * this.scale];
      this.rightPath.segments[i].point = [i * this.step, (-rightBands[i - 1]) * this.scale];
    }

    this.leftPath.smooth();
    this.rightPath.smooth();

    this.group.pivot = [this.leftPath.position.x, 0];
    this.group.position = this.view.center;

    _.throttle(() => this._updateGradient(), 1000)();
    this.currentIndex = (this.currentIndex < freqData.length - 1) ? this.currentIndex + 1 : 0;
  }

  _handleAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext && !this.audio) {
      const audio = this.audio = new AudioContext();
      const gainNode = this.gainNode = audio.createGain();
      const source = this.source = audio.createBufferSource();

      // Create two separate analyzers for left and right channel.
      const analyserL = this.analyserL = audio.createAnalyser();
      analyserL.smoothingTimeConstant = this.smoothingTimeConstant;
      analyserL.fftSize = this.fftSize;

      const analyserR = this.analyserR = audio.createAnalyser();
      analyserR.smoothingTimeConstant = this.smoothingTimeConstant;
      analyserR.fftSize = this.fftSize;

      // Create the buffer to receive the analyzed data.
      this.freqByteData = new Uint8Array(analyserL.frequencyBinCount);

      // Create a splitter to feed them both
      const splitter = audio.createChannelSplitter();

      // Connect audio processing graph
      source.connect(splitter);
      splitter.connect(analyserL, 0, 0);
      splitter.connect(analyserR, 1, 0);

      // Connect audio volume
      source.connect(gainNode);
      gainNode.connect(audio.destination);
      gainNode.gain.value = 0;

      source.loop = true;
      audio.decodeAudioData(this.track,
        buffer => {
          source.buffer = buffer;
          source.start(0);
          this.view.play();
        },
      );
    }
  }

  _updateGradient() {
    // const step = 240 / this.view.size.width;
    // const gradientColorsCount = this.baseGradientColors.length;
    // const stopsCount = this.rightPath.strokeColor.gradient.stops.length;
    // for (let i = gradientColorsCount - 1; i >= 0; i--) {
    //   const delta = this.baseGradientColors[i].hue - 90;
    //   const newHue = this.currentGradientX * step + delta;
    //   this.gradientColors[i].hue = newHue;
    //   const index = gradientColorsCount - 1 - i;
    //   this.rightPath.strokeColor.gradient.stops[1 + index].color = this.gradientColors[i];
    //   if (i !== 0) {
    //     this.rightPath.strokeColor.gradient.stops[stopsCount - 2 - index].color = this.gradientColors[i];
    //   }
    // }
    this.rightPath.strokeColor.origin = [(this.currentGradientX - this.gradientCurrWidth / 2), 0];
    this.rightPath.strokeColor.destination = [(this.currentGradientX + this.gradientCurrWidth / 2), 0];
  }

  _normalizeGMData(x) {
    const step = 20 / this.view.size.width;
    const delta = this.view.size.width / 2;
    const normX = x / step + delta;
    return normX;
  }

  // handlers:
  onFrame(event) {
    // style
    this.gradientCurrWidth = isDesktop() ? (Math.sin(event.time * 5) * 0.1 + 1) * this.gradientWidth : this.gradientWidth;
    const gradientColorsCount = this.baseGradientColors.length;
    const stopsCount = this.rightPath.strokeColor.gradient.stops.length;
    for (let i = gradientColorsCount - 1; i >= 0; i--) {
      if (isDesktop()) {
        this.gradientColors[i].brightness += Math.sin(event.time * 5) * 0.005;
      } else {
        this.gradientColors[i].brightness = this.baseGradientColors[i].brightness;
      }
      const index = gradientColorsCount - 1 - i;
      this.rightPath.strokeColor.gradient.stops[1 + index].color = this.gradientColors[i];
      if (i !== 0) {
        this.rightPath.strokeColor.gradient.stops[stopsCount - 2 - index].color = this.gradientColors[i];
      }
    }
    // position
    const delta = this.cursorPositionX - this.currentGradientX;
    if (Math.abs(delta) >= this.gradientDelta) {
      if (delta > 0) {
        this.currentGradientX += this.gradientSpeed;
      } else {
        this.currentGradientX -= this.gradientSpeed;
      }
    } else if (isDesktop()) {
      this.currentGradientX = this.cursorPositionX;
    }
    this._updatePaths();
  }
  onDeviceRotate(x) {
    this.cursorPositionX = this._normalizeGMData(x);
  }
}

export default Oscillators;
