import { ChannelId } from "../core/ChannelId";
import { ChannelTitle } from "../core/ChannelTitle";
import { VideoTitle } from "../core/VideoTitle";
import { ChannelPage, VideoPage } from "./PageFetcher";

function getContinuation(page: VideoPage) {
  const res = page.html.match(/{"continuation":"(.+?)"/);
  if (!res) {
    return undefined;
  }
  return res[1];
}

function getInnertubeApiKey(page: VideoPage) {
  const res = page.html.match(/"INNERTUBE_API_KEY":"(.+?)"/);
  if (!res) {
    return undefined;
  }
  return res[1];
}

function getInnertubeClientName(page: VideoPage) {
  const res = page.html.match(/"INNERTUBE_CLIENT_NAME":"(.+?)"/);
  if (!res) {
    return undefined;
  }
  return res[1];
}

function getInnertubeClientVersion(page: VideoPage) {
  const res = page.html.match(/"INNERTUBE_CLIENT_VERSION":"(.+?)"/);
  if (!res) {
    return undefined;
  }
  return res[1];
}

export const Scraper = {
  getChannelTitleFromVideoPage(page: VideoPage) {
    const res = page.html.match(/"ownerChannelName":"(.+?)"/);
    if (!res) {
      throw new Error("Channel name not found.");
    }
    return new ChannelTitle(res[1]);
  },

  getSubscriberCount(page: VideoPage | ChannelPage) {
    // the pattern matching is constructed for Japanese.
    const res = page.html.match(/チャンネル登録者数 (\d+\.?\d*)(万)?人/);
    if (!res) {
      throw new Error("Subscriber count not found.");
    }
    const subscriberCount = Number.parseFloat(res[1]) * (res[2] ? 10000 : 1);

    return subscriberCount;
  },

  getOwnerIconUrlFromVideoPage(page: VideoPage) {
    const res = page.html.match(/"videoOwnerRenderer":{"thumbnail":{"thumbnails":\[{"url":"(.+?)"/);
    if (!res) {
      throw new Error("Owner icon url not found.");
    }
    return res[1];
  },

  getChannelId(page: VideoPage) {
    const res = page.html.match(/"externalChannelId":"(.+?)"/);
    if (!res) {
      throw new Error("externalChannelId not found.");
    }
    return new ChannelId(res[1]);
  },

  getVideoTitle(page: VideoPage) {
    const meta = page.rootNode.querySelector("meta[name='title']");
    if (!meta) {
      throw new Error("<meta name='title'> is missing.");
    }
    const res = meta.getAttribute("content");
    if (!res) {
      throw new Error("<meta name='title'> is not having 'content' attribute.");
    }
    return new VideoTitle(res);
  },

  getVideoThumbnail(page: VideoPage) {
    const meta = page.rootNode.querySelector("meta[property='og:image']");
    if (!meta) {
      throw new Error("<meta property='og:image'> is missing.");
    }
    const res = meta.getAttribute("content");
    if (!res) {
      throw new Error("<meta property='og:image'> is not having 'content' attribute.");
    }
    return res;
  },

  getLikeCount(page: VideoPage) {
    const statisticTag = page.rootNode.querySelector(
      "div[itemprop='interactionStatistic'] meta[content='https://schema.org/LikeAction']",
    );
    if (!statisticTag) {
      return undefined;
    }
    const likeCountTag = statisticTag.parentNode.querySelector(
      "meta[itemprop='userInteractionCount']",
    );
    if (!likeCountTag) {
      throw new Error("<meta itemprop='userInteractionCount'> is missing.");
    }
    const likeCount = likeCountTag.getAttribute("content");
    if (!likeCount) {
      throw new Error("<meta itemprop='userInteractionCount'> is not having 'content' attribute.");
    }
    return Number.parseInt(likeCount);
  },

  isLiveNow(page: VideoPage) {
    return !!page.html.match(/"isLiveNow":true/);
  },

  hasStreamingInLive(page: ChannelPage) {
    return !!page.html.match(/"liveBadgeText"/);
  },

  getLiveViewCount(page: VideoPage) {
    const res = page.html.match(/"originalViewCount":"(\d+)"/);
    if (!res) {
      throw new Error("Live view count not found.");
    }
    return Number.parseInt(res[1]);
  },

  getLiveChatApiParameters(page: VideoPage) {
    const continuation = getContinuation(page);
    const apiKey = getInnertubeApiKey(page);
    const clientName = getInnertubeClientName(page);
    const clientVersion = getInnertubeClientVersion(page);

    if (continuation && apiKey && clientName && clientVersion) {
      return {
        continuation,
        apiKey,
        clientName,
        clientVersion,
      };
    } else {
      return undefined;
    }
  },

  getOwnerIconUrlFromChannelPage(page: ChannelPage) {
    const element = page.rootNode.querySelector('link[rel="image_src"]');
    if (!element) {
      throw new Error("<link rel='image_src'> is missing.");
    }
    const href = element.getAttribute("href");
    if (!href) {
      throw new Error("<link rel='image_src'> is not having 'href' attribute.");
    }
    return href;
  },

  getChannelBanner(page: ChannelPage) {
    const res = page.html.match(
      /"banner":{"imageBannerViewModel":{"image":{"sources":\[{"url":"(.+?)"/,
    );
    if (!res) {
      return undefined;
    }
    return res[1];
  },

  getChannelTitleFromChannelPage(page: ChannelPage) {
    const element = page.rootNode.querySelector('meta[itemprop="name"]');
    if (!element) {
      throw new Error("<meta itemprop='name'> is missing.");
    }
    const res = element.getAttribute("content");
    if (!res) {
      throw new Error("<meta itemprop='name'> is not having 'content' attribute.");
    }
    return new ChannelTitle(res);
  },
};
