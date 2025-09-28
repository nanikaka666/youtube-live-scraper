import parse, { HTMLElement } from "node-html-parser";
import { fetchAsString } from "../infrastructure/fetch";

export interface VideoPage {
  type: "video";
  videoId: string;
  html: string;
  rootNode: HTMLElement;
}

export interface ChannelPage {
  type: "channel";
  channelId: string;
  html: string;
  rootNode: HTMLElement;
}

export async function getVideoPage(videoId: string): Promise<VideoPage> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const html = await fetchAsString(url);
  const rootNode = parse(html);

  return {
    type: "video",
    videoId: videoId,
    html: html,
    rootNode: rootNode,
  };
}

export async function getLivePage(channelId: string): Promise<VideoPage | ChannelPage> {
  // const url = channelId.isHandle
  //   ? `https://www.youtube.com/${channelId.id}/live`
  //   : `https://www.youtube.com/channel/${channelId.id}/live`;
  const url = `https://www.youtube.com/${channelId}/live`;
  const html = await fetchAsString(url);
  const rootNode = parse(html);

  const element = rootNode.querySelector('link[rel="canonical"]');
  if (!element) {
    throw new Error("<link rel='canonical'> is missing.");
  }
  const href = element.getAttribute("href");
  if (!href) {
    throw new Error("<link rel='canonical'> is not having 'href' attribute.");
  }
  const res = href.match(/^https:\/\/www\.youtube\.com\/watch\?v=(.+)$/);

  return !res
    ? { type: "channel", channelId: channelId, html: html, rootNode: rootNode }
    : { type: "video", videoId: res[1], html: html, rootNode: rootNode };
}

export async function getChannelPage(channelId: string): Promise<ChannelPage> {
  // const url = channelId.isHandle
  //   ? `https://www.youtube.com/${channelId.id}`
  //   : `https://www.youtube.com/channel/${channelId.id}`;
  const url = `https://www.youtube.com/${channelId}`;
  const html = await fetchAsString(url);
  const rootNode = parse(html);

  return { type: "channel", channelId: channelId, html: html, rootNode: rootNode };
}
