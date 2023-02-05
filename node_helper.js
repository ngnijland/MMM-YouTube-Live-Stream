const NodeHelper = require('node_helper');
const playwright = require('playwright');

module.exports = NodeHelper.create({
  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case 'GET_CHANNEL_STATUS': {
        this.getChannelStatus();
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

  getChannelStatus: async function () {
    this.sendSocketNotification('CHANNEL_STATUS', 'pending');

    const browser = await playwright.chromium.launch({ headless: false });
    const page = await browser.newPage();

    const channel = '@GoodGood';
    // const channel = '@LofiGirl';

    await page.goto(`https://www.youtube.com/${channel}/live`);

    const terms = page.getByText('Before you continue to YouTube');

    if (await terms.isVisible()) {
      await page.getByText(/Reject all/i).click();
      await page.pause();
    }

    const node1 = await page.getByText('Started streaming on').count();

    this.sendSocketNotification('CHANNEL_STATUS', {
      goodgood: node1,
    });

    await browser.close();
  },
});
