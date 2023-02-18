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

    this.channel = this.config.channel;
    this.videoId;

    if (typeof this.channel !== 'string' && this.channel !== '') {
      Log.error(
        `"${this.channel}" is not a supported value. Please enter a valid channel name`
      );
      return;
    }

    this.sendSocketNotification('GET_CHANNEL_STATUS', this.channel);
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case 'CHANNEL_STATUS': {
        if (payload.status === 'ERROR') {
          Log.error(payload.message);
          return;
        }

        if (payload.status === 'DONE' && payload.streaming) {
          this.videoId = payload.videoId;
          this.updateDom();
        }

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
    if (!this.videoId) {
      return document.createElement('div');
    }

    const iframe = document.createElement('iframe');
    iframe.className = 'MMM-YouTube-LiveStream__iframe';
    iframe.src = `https://www.youtube.com/embed/${this.videoId}?autoplay=1`;

    return iframe;
  },

  getStyles: function () {
    return [this.file('css/MMM-YouTube-Live-Stream.css')];
  },
});
