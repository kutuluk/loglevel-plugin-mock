function Mock() {
  let loglevel;
  let originalFactory;
  let method;

  const pluginFactory = () => method;
  const defaults = { method: () => {} };

  this.apply = (logger, options) => {
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

  this.disable = () => {
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

const mock = new Mock();
export default mock;
