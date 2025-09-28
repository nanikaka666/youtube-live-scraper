import parse, { HTMLElement } from "node-html-parser";
import { fetchAsString } from "../infrastructure/fetch";

export class ChannelPage {
  readonly #html: string;
  readonly #rootNode: HTMLElement;
  private constructor(html: string) {
    this.#html = html;
    this.#rootNode = parse(html);
  }
  static async init(channelId: string) {
    // const url = channelId.isHandle
    //   ? `https://www.youtube.com/${channelId.id}`
    //   : `https://www.youtube.com/channel/${channelId.id}`;
    const url = `https://www.youtube.com/${channelId}`;
    const html = await fetchAsString(url);
    return new this(html);
  }

  getOwnerIconUrl() {
    const element = this.#rootNode.querySelector('link[rel="image_src"]');
    if (!element) {
      throw new Error("<link rel='image_src'> is missing.");
    }
    const href = element.getAttribute("href");
    if (!href) {
      throw new Error("<link rel='image_src'> is not having 'href' attribute.");
    }
    return href;
  }

  getChannelBanner() {
    const res = this.#html.match(
      /"banner":{"imageBannerViewModel":{"image":{"sources":\[{"url":"(.+?)"/,
    );
    if (!res) {
      return undefined;
    }
    return res[1];
  }

  getChannelTitle() {
    const element = this.#rootNode.querySelector('meta[itemprop="name"]');
    if (!element) {
      throw new Error("<meta itemprop='name'> is missing.");
    }
    const res = element.getAttribute("content");
    if (!res) {
      throw new Error("<meta itemprop='name'> is not having 'content' attribute.");
    }
    return res;
  }

  // duplicate implementation (VideoPage)
  getSubscriberCount() {
    // the pattern matching is constructed for Japanese.
    const res = this.#html.match(/チャンネル登録者数 (\d+\.?\d*)(万)?人/);
    if (!res) {
      throw new Error("Subscriber count not found.");
    }
    const subscriberCount = Number.parseFloat(res[1]) * (res[2] ? 10000 : 1);

    return subscriberCount;
  }
}
