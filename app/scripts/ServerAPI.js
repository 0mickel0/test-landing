import ServerClient from 'sp-utils-serverclient';

export default class ServerAPI extends ServerClient {
  initialize() {}

  _isServer() {
    // can use stubs
    return false;
  }

  getData() {
    return this.get({
      url: '/api',
      stub: async => {
        async.resolve('stub data');
      },
    });
  }

  getAudio(url) {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    return new Promise((resolve, reject) => {
      request.onload = () => {
        resolve(request.response);
      };
      request.onerror = () => {
        reject();
      };
      request.send();
    });
  }
}
