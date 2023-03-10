const NodeHelper = require('node_helper');
const playwright = require('playwright');

module.exports = NodeHelper.create({
  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case 'GET_CHANNEL_STATUS': {
        this.getChannelStatus(payload);
        break;
      }
      default: {
        this.sendSocketNotification(
          'ERROR',
          `Socket notification error: Unknown notification "${notification}" received from module. Please submit an issue in the MMM-YouTube-Live-Stream repository.`
        );
      }
    }
  },

  getChannelStatus: async function ({ channel, timeout }) {
    this.sendSocketNotification('CHANNEL_STATUS', { status: 'LOADING' });

    let browser;
    let page;

    try {
      browser = await playwright.chromium.launch();
      const context = await browser.newContext({ locale: 'en-US' });
      page = await context.newPage();
    } catch {
      this.sendSocketNotification('CHANNEL_STATUS', {
        status: 'ERROR',
        message: "Couldn't start headless browser.",
      });

      return;
    }

    try {
      await page.goto(`https://www.youtube.com/${channel}/live`);
    } catch {
      this.sendSocketNotification('CHANNEL_STATUS', {
        status: 'ERROR',
        message: 'No internet connection...',
      });

      return;
    }

    try {
      await page.getByRole('button', { name: 'Reject all' }).click();
    } catch {
      this.sendSocketNotification('CHANNEL_STATUS', {
        status: 'ERROR',
        message:
          'Playwright couldn\'t click "Reject all" in cookie notice. Maybe the YouTube made changes in the page?',
      });
    }

    const streamingLocator = page
      .locator('#description-inner')
      .getByText(/^Started streaming on/);

    try {
      await streamingLocator.waitFor({ timeout });
    } catch {
      this.sendSocketNotification('CHANNEL_STATUS', {
        status: 'DONE',
        streaming: false,
      });

      return;
    }

    try {
      const metaNode = await page.$('[itemprop=videoId]');
      const videoId = await metaNode.getAttribute('content');

      this.sendSocketNotification('CHANNEL_STATUS', {
        status: 'DONE',
        streaming: true,
        videoId,
      });
    } catch {
      this.sendSocketNotification('CHANNEL_STATUS', {
        status: 'ERROR',
        message:
          'Something went wrong with fetching the videoId from live stream.',
      });
    }

    await browser.close();
  },
});
