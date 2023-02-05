/* global Module */

/* Magic Mirror
 * Module: MMM-YouTube-Live-Stream
 *
 * By Niek Nijland <ngnijland@gmail.com>
 * MIT Licensed.
 */

Module.register('MMM-YouTube-Live-Stream', {
  defaults: {},

  start: function () {
    Log.info(`Starting module: ${this.name}`);

    this.sendSocketNotification('GET_CHANNEL_STATUS');
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case 'CHANNEL_STATUS': {
        Log.info(payload);
        break;
      }
      default: {
        Log.error(
          `Socket notivication error: Unknown notification "${notification}" received from node_helper. Please submit an issue in the MMM-YouTube-Live_stream repository.`
        );
      }
    }
  },

  getDom: function () {
    const wrapper = document.createElement('div');

    return wrapper;
  },

  getStyles: function () {
    return [this.file('css/MMM-YouTube-Live-Stream.css')];
  },
});
