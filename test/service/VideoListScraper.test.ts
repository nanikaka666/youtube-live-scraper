import parse from "node-html-parser";
import { VideoId } from "../../src/core/VideoId";
import { StreamsPage, VideosPage } from "../../src/service/PageFetcher";
import { ChannelId } from "../../src/core/ChannelId";
import {
  FinishedLiveVideoMetaItem,
  NotFinishedLiveVideoMetaItem,
  VideoListScraper,
  VideoMetaItem,
} from "../../src/service/VideoListScraper";
import { VideoTitle } from "../../src/core/VideoTitle";

function helper(html: string) {
  return {
    html: html,
    rootNode: parse(html),
  };
}

describe("getLatestVideos", () => {
  test.each([
    [
      `<html>
            <script>var a = {}</script>
       </html>`,
      [],
    ],
    [
      `<html>
            <script>var a = [
                {
                    "videoRenderer":{"videoId":"AAAAAAAAAAA","thumbnail":{"thumbnails":[{"url":"https://example.com/image1"}]}},
                    "title":{"runs":[{"text":"Video Title 1"}]},
                    "lengthText":{"accessibility":{"accessibilityData":{"label":"1 時間 15 分"}}},
                },
                {
                    "videoRenderer":{"videoId":"BBBBBBBBBBB","thumbnail":{"thumbnails":[{"url":"https://example.com/image2"}]}},
                    "title":{"runs":[{"text":"Video Title 2"}]},
                    "lengthText":{"accessibility":{"accessibilityData":{"label":"33 分"}}},
                },
            ]</script>
       </html>`,
      [
        {
          type: "video",
          videoId: new VideoId("AAAAAAAAAAA"),
          videoTitle: new VideoTitle("Video Title 1"),
          videoThumbnail: "https://example.com/image1",
          duration: "1 時間 15 分",
        },
        {
          type: "video",
          videoId: new VideoId("BBBBBBBBBBB"),
          videoTitle: new VideoTitle("Video Title 2"),
          videoThumbnail: "https://example.com/image2",
          duration: "33 分",
        },
      ] satisfies VideoMetaItem[],
    ],
  ])("successfully get videos title.", (html, expected) => {
    const page: VideosPage = {
      type: "videos",
      channelId: new ChannelId("@example"),
      ...helper(html),
    };

    expect(VideoListScraper.getLatestVideos(page)).toEqual(expected);
  });
});

describe("getLatestLiveVideos", () => {
  test.each([
    [
      `<html>
            <script>var a = {}</script>
       </html>`,
      [],
    ],
    [
      `<html>
            <script>var a = [
                {
                    "videoRenderer":{"videoId":"AAAAAAAAAAA","thumbnail":{"thumbnails":[{"url":"https://example.com/image1"}]}},
                    "title":{"runs":[{"text":"Video Title 1"}]},
                },
                {
                    "videoRenderer":{"videoId":"BBBBBBBBBBB","thumbnail":{"thumbnails":[{"url":"https://example.com/image2"}]}},
                    "title":{"runs":[{"text":"Video Title 2"}]},
                },
                {
                    "videoRenderer":{"videoId":"CCCCCCCCCCC","thumbnail":{"thumbnails":[{"url":"https://example.com/image3"}]}},
                    "title":{"runs":[{"text":"Video Title 3"}]},
                    "lengthText":{"accessibility":{"accessibilityData":{"label":"3 時間 45 分"}}},
                },
                {
                    "videoRenderer":{"videoId":"DDDDDDDDDDD","thumbnail":{"thumbnails":[{"url":"https://example.com/image4"}]}},
                    "title":{"runs":[{"text":"Video Title 4"}]},
                    "lengthText":{"accessibility":{"accessibilityData":{"label":"8 分"}}},
                },
            ]</script>
       </html>`,
      [
        {
          type: "not_finished_live_video",
          videoId: new VideoId("AAAAAAAAAAA"),
          videoTitle: new VideoTitle("Video Title 1"),
          videoThumbnail: "https://example.com/image1",
        },
        {
          type: "not_finished_live_video",
          videoId: new VideoId("BBBBBBBBBBB"),
          videoTitle: new VideoTitle("Video Title 2"),
          videoThumbnail: "https://example.com/image2",
        },
        {
          type: "finished_live_video",
          videoId: new VideoId("CCCCCCCCCCC"),
          videoTitle: new VideoTitle("Video Title 3"),
          videoThumbnail: "https://example.com/image3",
          duration: "3 時間 45 分",
        },
        {
          type: "finished_live_video",
          videoId: new VideoId("DDDDDDDDDDD"),
          videoTitle: new VideoTitle("Video Title 4"),
          videoThumbnail: "https://example.com/image4",
          duration: "8 分",
        },
      ] satisfies (NotFinishedLiveVideoMetaItem | FinishedLiveVideoMetaItem)[],
    ],
  ])("successfully get videos title.", (html, expected) => {
    const page: StreamsPage = {
      type: "streams",
      channelId: new ChannelId("@example"),
      ...helper(html),
    };

    expect(VideoListScraper.getLatestLiveVideos(page)).toEqual(expected);
  });
});
