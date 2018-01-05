(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.Nova = global.Nova || {})));
}(this, (function (exports) { 'use strict';

var _ = function () {
    var EL = document.createElement('div'),
        isW3c = 'addEventListener' in EL,
        own = Object.prototype.hasOwnProperty;
    var pad = isW3c ? "" : "on";
    return {
        on: function () {
            var fn = isW3c ? 'addEventListener' : 'attachEvent';
            return function (el, name, callback, capture) {
                el[fn](pad + name, callback, capture);
            };
        }(),
        off: function () {
            var fn = isW3c ? 'removeEventListener' : 'detachEvent',
                fix;
            return function (el, name, callback, capture) {
                el[fn](pad + name, callback, capture);
            };
        }(),
        isEmptyObject: function isEmptyObject(obj) {
            for (var key in obj) {
                if (own.call(obj, key)) {
                    return false;
                }
            }
            return true;
        },

        origin: function origin(uri) {
            if (uri == "*") return uri;
            var idx = uri.indexOf("/", 8);
            if (!~idx) return uri;
            return uri.substring(0, idx);
        }
    };
}();

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var Emitter = function () {
    function Emitter() {
        classCallCheck(this, Emitter);

        this._queue = {};
        this._regexp = /message:(.+)/;
    }

    createClass(Emitter, [{
        key: "addEventListener",
        value: function addEventListener(eventName, callback, scope) {
            var fnList = this._queue[eventName];
            if (!fnList) {
                fnList = this._queue[eventName] = [];
            }
            fnList[fnList.length] = {
                callback: callback,
                scope: scope
            };
            return this;
        }
    }, {
        key: "removeEventListener",
        value: function removeEventListener(evenName, callback, scope) {
            var fnList = this._queue[eventName],
                newList = [];
            if (fnList) return;
            for (var i = 0, len = fnList.length; i < len; i++) {
                var event = fnList[i];
                if (event.callback != callback && scope != scope) {
                    newList[newList.length] = event;
                }
            }
            this._queue = newList;
            return this;
        }
    }, {
        key: "dispatchEvent",
        value: function dispatchEvent(eventName) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            var match = eventName.match(this._regexp),
                fnList = void 0,
                data = args;
            if (match) {
                var type = match[1];
                fnList = this._queue['message'] || [];
                data = [{
                    type: type,
                    data: args,
                    origin: location.href || "*",
                    timestame: +new Date()
                }];
            } else {
                fnList = this._queue[eventName] || [];
            }
            for (var i = 0, len = fnList.length; i < len; i++) {
                var fn = fnList[i];
                var quiet = fn.callback.apply(fn.scope, data);
            }
            return this;
        }
    }]);
    return Emitter;
}();

var Notification = function (_Emitter) {
    inherits(Notification, _Emitter);

    function Notification(window, origin) {
        classCallCheck(this, Notification);

        var _this = possibleConstructorReturn(this, (Notification.__proto__ || Object.getPrototypeOf(Notification)).call(this));

        _this._win = window;
        _this._origin = origin || "*";
        _this._global = new Function('return this')();
        _this._isSupport = 'postMessage' in _this._global;
        _this._monitor();
        return _this;
    }

    createClass(Notification, [{
        key: '_monitor',
        value: function _monitor() {
            if (this._isSupport) {
                _.on(this._global, 'message', this._receive.bind(this), false);
            }
            this.addEventListener('message', this._postMessage, this);
        }
    }, {
        key: '_receive',
        value: function _receive(evt) {
            var res = void 0;
            try {
                res = JSON.parse(evt.data);
            } catch (e) {}
            if (res && !_.isEmptyObject(res)) {
                if (res.origin == this._origin || this._origin == "*") {
                    this.dispatchEvent.apply(this, [res.type].concat(res.data));
                }
            }
        }
    }, {
        key: '_postMessage',
        value: function _postMessage(evt) {
            if (this._isSupport && this._win) {
                var f = this._win.postMessage(JSON.stringify(evt), _.origin(this._origin) || "*");
            }
        }
    }]);
    return Notification;
}(Emitter);

exports.Notification = Notification;

Object.defineProperty(exports, '__esModule', { value: true });

})));
