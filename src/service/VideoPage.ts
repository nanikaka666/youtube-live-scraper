import { fetchAsString } from "../infrastructure/fetch";
import { HTMLElement, parse } from "node-html-parser";

export class VideoPage {
  readonly #html: string;
  readonly #rootNode: HTMLElement;
  private constructor(html: string) {
    this.#html = html;
    this.#rootNode = parse(this.#html);
  }
  static async init(videoId: string) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const html = await fetchAsString(url);
    return new this(html);
  }
  getChannelTitle() {
    const res = this.#html.match(/"ownerChannelName":"(.+?)"/);
    if (!res) {
      throw new Error("Channel name not found.");
    }
    return res[1];
  }
  getSubscriberCount() {
    // the pattern matching is constructed for Japanese.
    const res = this.#html.match(/チャンネル登録者数 (\d+\.?\d*)(万)?人/);
    if (!res) {
      throw new Error("Subscriber count not found.");
    }
    const subscriberCount = Number.parseFloat(res[1]) * (res[2] ? 10000 : 1);

    return subscriberCount;
  }
  getOwnerIconUrl() {
    const res = this.#html.match(
      /"videoOwnerRenderer":{"thumbnail":{"thumbnails":\[{"url":"(.+?)"/,
    );
    if (!res) {
      throw new Error("Owner icon url not found.");
    }
    return res[1];
  }
  getVideoTitle() {
    const meta = this.#rootNode.querySelector("meta[name='title']");
    if (!meta) {
      throw new Error("<meta name='title'> is missing.");
    }
    const res = meta.getAttribute("content");
    if (!res) {
      throw new Error("<meta name='title'> is not having 'content' attribute.");
    }
    return res;
  }
  getVideoThumbnail() {
    const meta = this.#rootNode.querySelector("meta[property='og:image']");
    if (!meta) {
      throw new Error("<meta property='og:image'> is missing.");
    }
    const res = meta.getAttribute("content");
    if (!res) {
      throw new Error("<meta property='og:image'> is not having 'content' attribute.");
    }
    return res;
  }
  getLikeCount() {
    const statisticTag = this.#rootNode.querySelector(
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

    return likeCount;
  }

  isLiveNow() {
    return !!this.#html.match(/"isLiveNow":true/);
  }

  getLiveViewCount() {
    const res = this.#html.match(/"originalViewCount":"(\d+)"/);
    if (!res) {
      throw new Error("Live view count not found.");
    }
    return Number.parseInt(res[1]);
  }

  getLiveChatApiParameters() {
    const continuation = this.#getContinuation();
    const apiKey = this.#getInnertubeApiKey();
    const clientName = this.#getInnertubeClientName();
    const clientVersion = this.#getInnertubeClientVersion();

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
  }

  #getContinuation() {
    const res = this.#html.match(/{"continuation":"(.+?)"/);
    if (!res) {
      return undefined;
    }
    return res[1];
  }

  #getInnertubeApiKey() {
    const res = this.#html.match(/"INNERTUBE_API_KEY":"(.+?)"/);
    if (!res) {
      return undefined;
    }
    return res[1];
  }

  #getInnertubeClientName() {
    const res = this.#html.match(/"INNERTUBE_CLIENT_NAME":"(.+?)"/);
    if (!res) {
      return undefined;
    }
    return res[1];
  }

  #getInnertubeClientVersion() {
    const res = this.#html.match(/"INNERTUBE_CLIENT_VERSION":"(.+?)"/);
    if (!res) {
      return undefined;
    }
    return res[1];
  }
}
