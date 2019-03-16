const EventEmitter = require('eventemitter3')

class AwaitTillReady extends EventEmitter {
  constructor() {
    super();
    this._ready = false;
    this._promise = new Promise(resolve => this.once('ready', resolve));
  }

  ready() {
    this._ready = true;
    this.emit('ready');
  }

  use(parts) {
    Object.keys(parts).forEach((name) => {
      this[name] = this.wrap(parts[name]);
    });
    return this;
  }

  wrap(method) {
    if (typeof method !== 'function') {
      return Object.keys(method).reduce((acc, name) => {
        acc[name] = this.wrap(method[name]);
        return acc;
      }, {});
    }
    return (async function wrapper(...args) {
      if (!this._ready) await this._promise;
      return method.apply(this, args);
    }).bind(this);
  }
}

module.exports = AwaitTillReady;
