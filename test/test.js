const expect = require('chai').expect;
const log = require('loglevel');
const sinon = require('sinon');
const mock = require('../lib/loglevel-plugin-mock');

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

const spy = sinon.spy();
const other = new Mock({ method: spy });

describe('API', () => {
  beforeEach(() => {
    /* eslint-disable no-empty */
    try {
      mock.disable();
    } catch (ignore) {}
    try {
      other.disable();
    } catch (ignore) {}
    try {
      mock.disable();
    } catch (ignore) {}
    /* eslint-enable no-empty */
    spy.reset();
  });

  it('Properties', () => {
    expect(mock).to.have.property('apply').with.be.a('function');
    expect(mock).to.have.property('disable').with.be.a('function');
  });

  it('Empty arguments', () => {
    expect(mock.apply).to.throw(TypeError, 'Argument is not a root loglevel object');
  });

  it('Not root loglevel argument', () => {
    expect(() => mock.apply(log.getLogger('log'))).to.throw(
      TypeError,
      'Argument is not a root loglevel object'
    );
  });

  it('Disable a not appled plugin', () => {
    expect(mock.disable).to.throw(Error, "You can't disable a not appled plugin");
  });

  it('Right assign', () => {
    expect(() => mock.apply(log)).to.not.throw();
  });

  it('Right disable', () => {
    mock.apply(log);

    expect(mock.disable).to.not.throw();
  });

  it('Reassign without other plugin', () => {
    mock.apply(log);

    expect(() => mock.apply(log)).to.not.throw();
  });

  it('Reassign with other plugin', () => {
    mock.apply(log);
    other.apply(log);

    expect(() => mock.apply(log)).to.throw(
      Error,
      "You can't reassign a plugin after appling another plugin"
    );
  });

  it('Disable with other plugin', () => {
    mock.apply(log);
    other.apply(log);

    expect(mock.disable).to.throw(Error, "You can't disable a plugin after appling another plugin");
  });

  it('Reassign after disable other plugin', () => {
    mock.apply(log);
    other.apply(log);
    other.disable();

    expect(() => mock.apply(log)).to.not.throw();
  });
});
