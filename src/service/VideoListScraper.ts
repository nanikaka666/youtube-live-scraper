import { VideoId } from "../core/VideoId";
import { VideoTitle } from "../core/VideoTitle";
import { StreamsPage, VideosPage } from "./PageFetcher";

export interface VideoMetaItem {
  type: "video";
  videoId: VideoId;
  videoTitle: VideoTitle;
  videoThumbnail: string;
  duration: string;
}

export interface FinishedLiveVideoMetaItem {
  type: "finished_live_video";
  videoId: VideoId;
  videoTitle: VideoTitle;
  videoThumbnail: string;
  duration: string;
}

export interface NotFinishedLiveVideoMetaItem {
  type: "not_finished_live_video";
  videoId: VideoId;
  videoTitle: VideoTitle;
  videoThumbnail: string;
}

function extractVideoIdsAndThumbnails(page: VideosPage | StreamsPage) {
  return [
    ...page.html.matchAll(
      /"videoRenderer":{"videoId":"(.+?)","thumbnail":{"thumbnails":\[{"url":"(.+?)"/g,
    ),
  ].map((res) => {
    return {
      videoId: new VideoId(res[1]),
      videoThumbnail: res[2],
    };
  });
}

function extractVideoTitles(page: VideosPage | StreamsPage) {
  return [...page.html.matchAll(/"title":{"runs":\[{"text":"(.+?)"/g)].map((res) => {
    return {
      videoTitle: new VideoTitle(res[1]),
    };
  });
}

function extractDurations(page: VideosPage | StreamsPage) {
  return [
    ...page.html.matchAll(/"lengthText":{"accessibility":{"accessibilityData":{"label":"(.+?)"/g),
  ].map((res) => {
    return {
      duration: res[1],
    };
  });
}

export const VideoListScraper = {
  /**
   * Returns a list of videos up to 30 in latest order.
   */
  getLatestVideos(page: VideosPage) {
    const videoIdsAndThumbnails = extractVideoIdsAndThumbnails(page);
    const videoTitles = extractVideoTitles(page);
    const durations = extractDurations(page);

    const res: VideoMetaItem[] = [];
    for (let i = 0; i < videoIdsAndThumbnails.length; i++) {
      res[i] = {
        type: "video",
        ...videoIdsAndThumbnails[i],
        ...videoTitles[i],
        ...durations[i],
      };
    }
    return res;
  },

  /**
   * Returns a list of streams up to 30 in latest order.
   *
   * if upcoming stream is contained in result, then the item has no duration.
   */
  getLatestLiveVideos(page: StreamsPage) {
    const videoIdsAndThumbnails = extractVideoIdsAndThumbnails(page);
    const videoTitles = extractVideoTitles(page);
    const durations = extractDurations(page);

    const notFinishedNum = videoIdsAndThumbnails.length - durations.length;

    const res: (FinishedLiveVideoMetaItem | NotFinishedLiveVideoMetaItem)[] = [];
    for (let i = 0; i < videoIdsAndThumbnails.length; i++) {
      if (i < notFinishedNum) {
        res[i] = {
          type: "not_finished_live_video",
          ...videoIdsAndThumbnails[i],
          ...videoTitles[i],
        } satisfies NotFinishedLiveVideoMetaItem;
      } else {
        res[i] = {
          type: "finished_live_video",
          ...videoIdsAndThumbnails[i],
          ...videoTitles[i],
          ...durations[i - notFinishedNum],
        } satisfies FinishedLiveVideoMetaItem;
      }
    }

    return res;
  },
};
