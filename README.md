# youtube-live-scraper

Provide some scraping features that get data about videos and lives streams.

# Getting Started

Install

```shell
npm i youtube-live-scraper
```

First, fetch the page you want to scrape, with `PageFetcher`.

```typescript
import { ChannelId, VideoId, PageFetcher } from "youtube-live-scraper";

/* Prepare variants for call methods. */

// You must wrap a channel id with ChannelId class for validation.
const channelId = new ChannelId("@example");

// Not Youtube handle style is also accepted.
// const channelId = new ChannelId("UCQ78z48fcZH_lCirexample")

// You must wrap a video id with VideoId class for validation.
const videoId = new VideoId("vvvvvvvvvvv");
```

```typescript
/* Call PageFetcher methods you want. */

// getChannelPage() returns a channel top page.
const channelPage = await PageFetcher.getChannelPage(channelId);

// getLivePage() returns a channel top page or closest live streaming page, the result changes by situation.
// if method called in time that live streaming is upcoming or streaming, then result is streaming page.
// otherwise channel top page.
const livePage = await PageFetcher.getLivePage(channelId);

// getVideosPage returns a "/videos" page.
const videosPage = await PageFetcher.getVideosPage(channelId);

// getStreamsPage returns a "/streams" page.
const streamsPage = await PageFetcher.getStreamsPage(channelId);

// getVideoPage returns a video page.
const videoPage = await PageFetcher.getVideoPage(videoId);
```

Get data you want to know using `Scraper` and `VideoListScraper`.

```typescript
import { Scraper, VideoListScraper } from "youtube-live-scraper";

console.log(Scraper.getSubscriberCount(videoPage));
console.log(Scraper.getChannelBanner(channelPage));
console.log(VideoListScraper.getLatestLiveVideos(streamsPage));
```

that's all!
