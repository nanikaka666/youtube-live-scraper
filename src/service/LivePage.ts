import parse, { HTMLElement } from "node-html-parser";
import { fetchAsString } from "../infrastructure/fetch";

export class LivePage {
  readonly #rootNode: HTMLElement;
  private constructor(rootNode: HTMLElement) {
    this.#rootNode = rootNode;
  }
  static async init(channelId: string) {
    // const url = channelId.isHandle
    //   ? `https://www.youtube.com/${channelId.id}/live`
    //   : `https://www.youtube.com/channel/${channelId.id}/live`;
    const url = `https://www.youtube.com/${channelId}/live`;
    const html = await fetchAsString(url);
    return new this(parse(html));
  }
  getClosestLiveVideoId() {
    const element = this.#rootNode.querySelector('link[rel="canonical"]');
    if (!element) {
      throw new Error("<link rel='canonical'> is missing.");
    }
    const href = element.getAttribute("href");
    if (!href) {
      throw new Error("<link rel='canonical'> is not having 'href' attribute.");
    }
    const res = href.match(/^https:\/\/www\.youtube\.com\/watch\?v=(.+)$/);
    if (!res) {
      return undefined;
    }
    return res[1];
  }
  hasStreamingOrUpcomingStreaming() {
    return this.getClosestLiveVideoId() !== undefined;
  }
}
