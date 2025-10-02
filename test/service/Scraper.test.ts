import parse from "node-html-parser";
import { VideoId } from "../../src/core/VideoId";
import { ChannelPage, VideoPage } from "../../src/service/PageFetcher";
import { Scraper } from "../../src/service/Scraper";
import { ChannelTitle } from "../../src/core/ChannelTitle";
import { ChannelId } from "../../src/core/ChannelId";
import { VideoTitle } from "../../src/core/VideoTitle";

function helper(html: string) {
  return {
    html: html,
    rootNode: parse(html),
  };
}

describe("getChannelTitleFromVideoPage", () => {
  test("successfully get channel title.", () => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(`
        <html>
            <script>var a = {"ownerChannelName":"Channel Title"}</script>
        </html>
    `),
    };

    expect(Scraper.getChannelTitleFromVideoPage(page)).toEqual(new ChannelTitle("Channel Title"));
  });

  test("if channel title not found then an exception will be thrown.", () => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(`
            <html>
                <script>var a = {}</script>
            </html>
        `),
    };

    expect(() => Scraper.getChannelTitleFromVideoPage(page)).toThrow(Error);
  });
});

describe("getSubscriberCountFromVideoPage", () => {
  test.each([
    ["チャンネル登録者数 1人", 1],
    ["チャンネル登録者数 25人", 25],
    ["チャンネル登録者数 333人", 333],
    ["チャンネル登録者数 1870人", 1870],
    ["チャンネル登録者数 4万人", 40000],
    ["チャンネル登録者数 1.11万人", 11100],
    ["チャンネル登録者数 20万人", 200000],
    ["チャンネル登録者数 30.4万人", 304000],
    ["チャンネル登録者数 328万人", 3280000],
  ])("successfully get subscriber counts.", (input, expected) => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(`
        <html>
            <script>var a = {"subscriberCountText":{"accessibility":{"accessibilityData":{"label":"${input}"}</script>
        </html>
    `),
    };

    expect(Scraper.getSubscriberCountFromVideoPage(page)).toEqual(expected);
  });

  test("if subscriber count not found then returns 0.", () => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(`
            <html>
                <script>var a = {}</script>
            </html>
        `),
    };

    expect(Scraper.getSubscriberCountFromVideoPage(page)).toEqual(0);
  });
});

describe.skip("in case of ChannelPage", () => {
  test.each([
    ["チャンネル登録者数 1人", 1],
    ["チャンネル登録者数 25人", 25],
    ["チャンネル登録者数 333人", 333],
    ["チャンネル登録者数 1870人", 1870],
    ["チャンネル登録者数 4万人", 40000],
    ["チャンネル登録者数 5.74万人", 57400],
    ["チャンネル登録者数 20万人", 200000],
    ["チャンネル登録者数 30.4万人", 304000],
    ["チャンネル登録者数 328万人", 3280000],
  ])("successfully get subscriber counts.", (input, expected) => {
    const page: ChannelPage = {
      type: "channel",
      channelId: new ChannelId("@example"),
      ...helper(`
        <html>
            <script>var a = {"simpleText":"${input}"}</script>
        </html>
    `),
    };

    expect(Scraper.getSubscriberCountFromVideoPage(page)).toEqual(expected);
  });

  test("if subscriber count not found then returns 0.", () => {
    const page: ChannelPage = {
      type: "channel",
      channelId: new ChannelId("@example"),
      ...helper(`
            <html>
                <script>var a = {}</script>
            </html>
        `),
    };

    expect(Scraper.getSubscriberCountFromVideoPage(page)).toEqual(0);
  });
});

describe("getOwnerIconFromVideoPage", () => {
  test("successfully get owner icon url.", () => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(`
        <html>
            <script>var a = {"videoOwnerRenderer":{"thumbnail":{"thumbnails":[{"url":"https://example.com/image"}]}}}</script>
        </html>
    `),
    };

    expect(Scraper.getOwnerIconUrlFromVideoPage(page)).toEqual("https://example.com/image");
  });

  test("if owner icon url not found then an exception will be thrown.", () => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(`
            <html>
                <script>var a = {}</script>
            </html>
        `),
    };

    expect(() => Scraper.getOwnerIconUrlFromVideoPage(page)).toThrow(Error);
  });
});

describe("getChannelId", () => {
  test("successfully get channel id.", () => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(`
        <html>
            <script>var a = {"externalChannelId":"UCQ78z42ZYZHLlCiDexample"}</script>
        </html>
    `),
    };

    expect(Scraper.getChannelId(page)).toEqual(new ChannelId("UCQ78z42ZYZHLlCiDexample"));
  });

  test("if channel id not found then an exception will be thrown.", () => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(`
            <html>
                <script>var a = {}</script>
            </html>
        `),
    };

    expect(() => Scraper.getChannelId(page)).toThrow(Error);
  });
});

describe("getVideoTitle", () => {
  test("successfully get video title.", () => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(`
        <html>
            <meta name="title" content="Video Title">
        </html>
    `),
    };

    expect(Scraper.getVideoTitle(page)).toEqual(new VideoTitle("Video Title"));
  });

  test.each([
    `<html>
        <script>var a = {}</script>
    </html>`,
    `<html>
        <meta name="title">
    </html>`,
  ])("if video title not found then an exception will be thrown.", (html) => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(html),
    };

    expect(() => Scraper.getVideoTitle(page)).toThrow(Error);
  });
});

describe("getVideoThumbnail", () => {
  test("successfully get video thumbnail.", () => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(`
        <html>
            <meta property="og:image" content="https://example.com/image">
        </html>
    `),
    };

    expect(Scraper.getVideoThumbnail(page)).toEqual("https://example.com/image");
  });

  test.each([
    `<html>
        <script>var a = {}</script>
    </html>`,
    `<html>
        <meta property="og:image">
    </html>`,
  ])("if video thumbnail not found then an exception will be thrown.", (html) => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(html),
    };

    expect(() => Scraper.getVideoThumbnail(page)).toThrow(Error);
  });
});

describe("getLikeCount", () => {
  test("successfully get like count.", () => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(`
        <html>
            <div itemprop="interactionStatistic" itemscope itemtype="https://schema.org/InteractionCounter">
                <meta itemprop="interactionType" content="https://schema.org/LikeAction">
                <meta itemprop="userInteractionCount" content="12345">
            </div>
        </html>
    `),
    };

    expect(Scraper.getLikeCount(page)).toEqual(12345);
  });

  test("if owner will set like counts to be invisible, then undefined will be returned.", () => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(`
        <html>
        </html>
    `),
    };

    expect(Scraper.getLikeCount(page)).toEqual(undefined);
  });

  test.each([
    `<html>
        <div itemprop="interactionStatistic" itemscope itemtype="https://schema.org/InteractionCounter">
            <meta itemprop="interactionType" content="https://schema.org/LikeAction">
        </div>
    </html>`,
    `<html>
        <div itemprop="interactionStatistic" itemscope itemtype="https://schema.org/InteractionCounter">
            <meta itemprop="interactionType" content="https://schema.org/LikeAction">
            <meta itemprop="userInteractionCount">
        </div>
    </html>`,
  ])("if like count not found (by broken html) then an exception will be thrown.", (html) => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(html),
    };

    expect(() => Scraper.getLikeCount(page)).toThrow(Error);
  });
});

describe("isLiveNow", () => {
  test("successfully get boolean which represent this live has been already started.", () => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(`
        <html>
            <script>var a = {"isLiveNow":true}</script>
        </html>
    `),
    };

    expect(Scraper.isLiveNow(page)).toEqual(true);
  });

  test("successfully get boolean which represent this live has been not started.", () => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(`
        <html>
            <script>var a = {"isLiveNow":false}</script>
        </html>
    `),
    };

    expect(Scraper.isLiveNow(page)).toEqual(false);
  });
});

describe("hasStreamingInLive", () => {
  test("successfully get boolean which represent this channel has a live that has been already started.", () => {
    const page: ChannelPage = {
      type: "channel",
      channelId: new ChannelId("@example"),
      ...helper(`
        <html>
            <script>var a = {"liveBadgeText":"ライブ"}</script>
        </html>
    `),
    };

    expect(Scraper.hasStreamingInLive(page)).toEqual(true);
  });

  test("successfully get boolean which represent this channel don't have a live that has been already started.", () => {
    const page: ChannelPage = {
      type: "channel",
      channelId: new ChannelId("@example"),
      ...helper(`
        <html>
            <script>var a = {}</script>
        </html>
    `),
    };

    expect(Scraper.hasStreamingInLive(page)).toEqual(false);
  });
});

describe("getLiveViewCount", () => {
  test("successfully get live view counts.", () => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(`
        <html>
            <script>var a = {"originalViewCount":"12345"}</script>
        </html>
    `),
    };

    expect(Scraper.getLiveViewCount(page)).toEqual(12345);
  });

  test("if live view count not found then an exception will be thrown.", () => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(`
        <html>
            <script>var a = {}</script>
        </html>
    `),
    };

    expect(() => Scraper.getLiveViewCount(page)).toThrow(Error);
  });
});

describe("getLiveChatApiParameters", () => {
  test("successfully get parameters for live chat API.", () => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(`
        <html>
            <script>var a = {"continuation":"CONTINUATION",
                "INNERTUBE_API_KEY":"API KEY",
                "INNERTUBE_CLIENT_NAME":"WEB",
                "INNERTUBE_CLIENT_VERSION":"0.1.2",
            }</script>
        </html>
    `),
    };

    expect(Scraper.getLiveChatApiParameters(page)).toEqual({
      continuation: "CONTINUATION",
      apiKey: "API KEY",
      clientName: "WEB",
      clientVersion: "0.1.2",
    });
  });

  test.each([
    `<html>
        <script>var a = {
            "INNERTUBE_API_KEY":"API KEY",
            "INNERTUBE_CLIENT_NAME":"WEB",
            "INNERTUBE_CLIENT_VERSION":"0.1.2",
        }</script>
    </html>`,
    `<html>
        <script>var a = {"continuation":"CONTINUATION",
            "INNERTUBE_CLIENT_NAME":"WEB",
            "INNERTUBE_CLIENT_VERSION":"0.1.2",
        }</script>
    </html>`,
    `<html>
        <script>var a = {"continuation":"CONTINUATION",
            "INNERTUBE_API_KEY":"API KEY",
            "INNERTUBE_CLIENT_VERSION":"0.1.2",
        }</script>
    </html>`,
    `<html>
        <script>var a = {"continuation":"CONTINUATION",
            "INNERTUBE_API_KEY":"API KEY",
            "INNERTUBE_CLIENT_NAME":"WEB",
        }</script>
    </html>`,
  ])("if parameters not found at least one then undefined will be returned.", (html) => {
    const page: VideoPage = {
      type: "video",
      videoId: new VideoId("VVVVVVVVVVV"),
      ...helper(html),
    };

    expect(Scraper.getLiveChatApiParameters(page)).toEqual(undefined);
  });
});

describe("getOwnerIconUrlFromChannelPage", () => {
  test("successfully get owner icon url.", () => {
    const page: ChannelPage = {
      type: "channel",
      channelId: new ChannelId("@example"),
      ...helper(`
        <html>
            <link rel="image_src" href="https://example.com/image">
        </html>
    `),
    };

    expect(Scraper.getOwnerIconUrlFromChannelPage(page)).toEqual("https://example.com/image");
  });

  test.each([
    `<html>
    </html>`,
    `<html>
        <link rel="image_src">
    </html>`,
  ])("if owner icon url not found then an exception will be thrown.", (html) => {
    const page: ChannelPage = {
      type: "channel",
      channelId: new ChannelId("@example"),
      ...helper(html),
    };

    expect(() => Scraper.getOwnerIconUrlFromChannelPage(page)).toThrow(Error);
  });
});

describe("getChannelBanner", () => {
  test("successfully get channel banner.", () => {
    const page: ChannelPage = {
      type: "channel",
      channelId: new ChannelId("@example"),
      ...helper(`
        <html>
            <script>var a = {"banner":{"imageBannerViewModel":{"image":{"sources":[{"url":"https://example.com/image"}]}}"}}</script>
        </html>
    `),
    };

    expect(Scraper.getChannelBanner(page)).toEqual("https://example.com/image");
  });

  test("if channel banner not set then undefined will be returned.", () => {
    const page: ChannelPage = {
      type: "channel",
      channelId: new ChannelId("@example"),
      ...helper(`
        <html>
            <script>var a = {}</script>
        </html>
    `),
    };

    expect(Scraper.getChannelBanner(page)).toEqual(undefined);
  });
});

describe("getChannelTitleFromChannelPage", () => {
  test("successfully get channel title.", () => {
    const page: ChannelPage = {
      type: "channel",
      channelId: new ChannelId("@example"),
      ...helper(`
        <html>
            <meta itemprop="name" content="Channel Title">
        </html>
    `),
    };

    expect(Scraper.getChannelTitleFromChannelPage(page)).toEqual(new ChannelTitle("Channel Title"));
  });

  test.each([
    `<html>
    </html>`,
    `<html>
        <meta itemprop="name">
    </html>`,
  ])("if channel title not found then an exception will be thrown.", (html) => {
    const page: ChannelPage = {
      type: "channel",
      channelId: new ChannelId("@example"),
      ...helper(html),
    };

    expect(() => Scraper.getChannelTitleFromChannelPage(page)).toThrow(Error);
  });
});
