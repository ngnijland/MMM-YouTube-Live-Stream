# MMM-YouTube-Live-Stream

A Magic Mirror module that shows a live stream whenever a YouTube channel starts streaming live.

## Installation

1. Go to the MagicMirror modules folder

```bash
cd ~/MagicMirror/modules
```

2. Clone this repository

```bash
git clone https://github.com/ngnijland/MMM-YouTube-Live-Stream.git
```

3. Install module dependencies

```bash
npm install
```

**Note:** Run this inside the `modules/MMM-YouTube-Live-Stream` folder.

4. Install Chromium

```bash
npx playwright install
```

5. Add this module to the modules array in the MagicMirror `config/config.js` file, like this:

```javascript
modules: [
  {
    module: "MMM-YouTube-Live-Stream",
    position: "middle_center"
  }
]
```

## How does it work

Since the YouTube API has rate limits that would prevent the module from constantly checking if a channel is live streaming, this module starts a headless browser on every interval. The browser navigates to `https://www.youtube.com/<CHANNEL_NAME>/live`. When the channel is not live streaming this url will re-direct to the channels main page. Otherwise the live stream will start to play. To programatically know if the channel is streaming this module searches for the text "Started streaming on" to be somewhere on the page. If this is true the module fetches the video id of the live stream from the pages meta data, close the headless browser, and uses that to stream the video in an iframe. If it can't find the text it waits for the timeout to expire and close the browser to start the process again in the next interval.

**NOTE:** The live stream check is done every interval even when the channel is live streaming. This is to find out when the live stream has ended to show a different ui.

## Configuration

Configure this module in your MagicMirror config file which is located at `config/config.js` in the MagicMirror repository. An example config for this module:

```javascript
modules: [
  {
    module: "MMM-YouTube-Live-Stream",
    position: "middle_center",
    config: {
      // Options
    }
  }
]
```

The following configurations are available:

Config                | Type                       | Default value        | Description
:---------------------|:---------------------------|:---------------------|:------------
`channel`             | `string`                   |                      | YouTube channel name (from url including the `@` symbol)
`updatesEvery`        | `number`                   | `300000` (5 minutes) | The number of miliseconds between each check if the channel is live streaming
`notStreamingTimeout` | `number`                   | `10000` (10 seconds) | The number of milisecondsbefore the headless browser times out when checking a YouTube channel if its live streaming.
