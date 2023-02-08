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

    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();

    // const channel = '@GoodGood';
    const channel = '@LofiGirl';

    await page.goto(`https://www.youtube.com/${channel}/live`);

    const terms = page.getByText('Before you continue to YouTube');

    try {
      await terms.waitFor({ timeout: 5000 });
      console.log('click');
      await page.getByRole('button', { name: 'Reject all' }).click();
    } catch {
      console.log(await page.locator('body').innerHTML());
      console.log('No cookie message');
    }

    const streamingLocator = page
      .locator('#description-inner')
      .getByText(/^Started streaming on/);

    let streaming;

    try {
      await streamingLocator.waitFor({ timeout: 5000 });
      streaming = true;
    } catch {
      streaming = false;
    }
    console.log(page.url());
    console.log(streaming);

    await browser.close();

    this.sendSocketNotification('CHANNEL_STATUS', {
      streaming,
    });
  },
});
