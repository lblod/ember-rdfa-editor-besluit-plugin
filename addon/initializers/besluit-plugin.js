import BesluitPlugin from '../besluit-plugin';

function pluginFactory(plugin) {
  return {
    create: (initializers) => {
      const pluginInstance = new plugin();
      Object.assign(pluginInstance, initializers);
      return pluginInstance;
    },
  };
}

export function initialize(application) {
  application.register('plugin:besluit', pluginFactory(BesluitPlugin), {
    singleton: false,
  });
}

export default {
  initialize,
};
