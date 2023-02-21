/* global Module */

/* Magic Mirror
 * Module: MMM-YouTube-Live-Stream
 *
 * By Niek Nijland <ngnijland@gmail.com>
 * MIT Licensed.
 */

Module.register('MMM-YouTube-Live-Stream', {
  defaults: {
    updatesEvery: 5 * 60 * 1000,
    notStreamingTimeout: 10 * 1000,
  },

  start: function () {
    Log.info(`Starting module: ${this.name}`);

    this.channel = this.config.channel;
    this.interval;
    this.status = 'loading';
    this.videoId;
    this.updatesEvery = this.config.updatesEvery;
    this.notStreamingTimeout = this.config.notStreamingTimeout;

    if (typeof this.channel !== 'string' && this.channel !== '') {
      Log.error(
        `"${this.channel}" is not a supported value. Please enter a valid channel name`
      );
      return;
    }

    if (typeof this.notStreamingTimeout !== 'number') {
      Log.error(
        `Configuration error: "notStreamingTimeout" should be a number, but is: "${typeof this
          .notStreamingTimeout}". Falling back to 10 seconds (${10 * 1000}).`
      );
      this.updatesEvery = 10 * 1000;
    }

    if (typeof this.updatesEvery !== 'number') {
      Log.error(
        `Configuration error: "updatesEvery" should be a number, but is: "${typeof this
          .updatesEvery}". Falling back to 5 minutes (${5 * 60 * 1000}).`
      );
      this.updatesEvery = 5 * 60 * 1000;
    }

    if (this.notStreamingTimeout > this.updatesEvery) {
      Log.error(
        'Configuration error: "updatesEvery" should be bigger than the "notStreamingTimeout" config, but is smaller. Please change this in the MagicMirror config.'
      );
      return;
    }

    this.startInterval();
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case 'CHANNEL_STATUS': {
        if (payload.status === 'ERROR') {
          Log.error(payload.message);
          this.status = 'error';
          this.updateDom();
          return;
        }

        if (payload.status === 'DONE') {
          if (payload.streaming && this.videoId) {
            return;
          }

          if (payload.streaming) {
            this.videoId = payload.videoId;
          } else {
            this.videoId = '';
          }

          this.status = 'idle';
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

  startInterval: function () {
    clearInterval(this.interval);

    this.sendSocketNotification('GET_CHANNEL_STATUS', {
      channel: this.channel,
      timeout: this.notStreamingTimeout,
    });

    this.interval = setInterval(() => {
      this.sendSocketNotification('GET_CHANNEL_STATUS', {
        channel: this.channel,
        timeout: this.notStreamingTimeout,
      });
    }, this.updatesEvery);
  },

  getDom: function () {
    const root = document.createElement('div');

    if (this.status === 'loading') {
      root.innerText = 'Checking channel...';
      return root;
    }

    if (this.status === 'error') {
      root.innerText = 'An error occured. Check the console for more info.';
      return root;
    }

    if (!this.videoId) {
      root.innerText = 'Channel is not streaming...';
      return root;
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
