(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["module", "exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports);
    global.mock = mod.exports;
  }
})(this, function (module, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  function Mock() {
    var loglevel = void 0;
    var originalFactory = void 0;
    var method = void 0;

    var pluginFactory = function pluginFactory() {
      return method;
    };
    var defaults = { method: function method() {} };

    this.apply = function (logger, options) {
      if (!logger || !logger.getLogger) {
        throw new TypeError('Argument is not a root loglevel object');
      }

      if (loglevel && pluginFactory !== logger.methodFactory) {
        throw new Error("You can't reassign a plugin after appling another plugin");
      }

      loglevel = logger;
      options = Object.assign({}, defaults, options);
      method = options.method;
      originalFactory = originalFactory || logger.methodFactory;
      logger.methodFactory = pluginFactory;
      logger.setLevel(logger.getLevel());
    };

    this.disable = function () {
      if (!loglevel) {
        throw new Error("You can't disable a not appled plugin");
      }

      if (pluginFactory !== loglevel.methodFactory) {
        throw new Error("You can't disable a plugin after appling another plugin");
      }

      loglevel.methodFactory = originalFactory;
      loglevel.setLevel(loglevel.getLevel());
      originalFactory = undefined;
      loglevel = undefined;
    };
  }

  var mock = new Mock();
  exports.default = mock;
  module.exports = exports["default"];
});
