import { ChannelId } from "../../src/core/ChannelId";
import { VideoId } from "../../src/core/VideoId";
import * as fetch from "../../src/infrastructure/fetch";
import {
  ChannelPage,
  getChannelPage,
  getLivePage,
  getStreamsPage,
  getVideoPage,
  getVideosPage,
  VideoPage,
} from "../../src/service/PageFetcher";

afterEach(() => {
  jest.clearAllMocks();
});

describe("getVideoPage", () => {
  test("successfully fetch the video page.", async () => {
    jest
      .spyOn(fetch, "fetchAsString")
      .mockImplementation(jest.fn(() => Promise.resolve("<html></html>")));

    const videoId = new VideoId("VVVVVVVVVVV");
    const actual = await getVideoPage(videoId);

    expect(actual.type).toEqual("video");
    expect(actual.videoId).toEqual(videoId);
    expect(actual.html).toEqual("<html></html>");

    expect(jest.mocked(fetch.fetchAsString).mock.calls[0][0]).toEqual(
      "https://www.youtube.com/watch?v=VVVVVVVVVVV",
    );
  });
});

describe("getLivePage", () => {
  test.each([new ChannelId("@example"), new ChannelId("UCQ78z42ZYZHLlCiDexample")])(
    "successfully fetch the live page, in case of it is video page.",
    async (channelId) => {
      const html = `
        <html>
            <head>
                <link rel="canonical" href="https://www.youtube.com/watch?v=VVVVVVVVVVV">
            </head>
        </html>
        `;
      jest.spyOn(fetch, "fetchAsString").mockImplementation(jest.fn(() => Promise.resolve(html)));

      const actual = await getLivePage(channelId);

      expect(actual.type).toEqual("video");
      expect((actual as VideoPage).videoId.id).toEqual("VVVVVVVVVVV");
      expect(actual.html).toEqual(html);
    },
  );

  test.each([new ChannelId("@example"), new ChannelId("UCQ78z42ZYZHLlCiDexample")])(
    "successfully fetch the live page, in case of it is channel top page.",
    async (channelId) => {
      const html = `
        <html>
            <head>
                <link rel="canonical" href="https://www.youtube.com/@example">
            </head>
        </html>
        `;
      jest.spyOn(fetch, "fetchAsString").mockImplementation(jest.fn(() => Promise.resolve(html)));

      const actual = await getLivePage(channelId);

      expect(actual.type).toEqual("channel");
      expect((actual as ChannelPage).channelId.id).toEqual(channelId.id);
      expect(actual.html).toEqual(html);
    },
  );

  test.each([
    `<html>
        <head>
        </head>
    </html>`,
    `<html>
        <head>
            <link rel="canonical">
        </head>
    </html>`,
  ])("if broken html will returned then an exception will be thrown.", async (html) => {
    jest.spyOn(fetch, "fetchAsString").mockImplementation(jest.fn(() => Promise.resolve(html)));

    expect(async () => {
      await getLivePage(new ChannelId("@example"));
    }).rejects.toThrow(Error);
  });

  test("check url style passed to infrastructure layer, in case of Youtube handle.", async () => {
    const html = `
        <html>
            <head>
                <link rel="canonical" href="https://www.youtube.com/watch?v=VVVVVVVVVVV">
            </head>
        </html>
        `;
    jest.spyOn(fetch, "fetchAsString").mockImplementation(jest.fn(() => Promise.resolve(html)));

    await getLivePage(new ChannelId("@example"));

    expect(jest.mocked(fetch.fetchAsString).mock.calls[0][0]).toEqual(
      "https://www.youtube.com/@example/live",
    );
  });

  test("check url style passed to infrastructure layer, in case of non Youtube handle.", async () => {
    const html = `
        <html>
            <head>
                <link rel="canonical" href="https://www.youtube.com/watch?v=VVVVVVVVVVV">
            </head>
        </html>
        `;
    jest.spyOn(fetch, "fetchAsString").mockImplementation(jest.fn(() => Promise.resolve(html)));

    await getLivePage(new ChannelId("UCQ78z42ZYZHLlCiDexample"));

    expect(jest.mocked(fetch.fetchAsString).mock.calls[0][0]).toEqual(
      "https://www.youtube.com/channel/UCQ78z42ZYZHLlCiDexample/live",
    );
  });
});

describe("getChannelPage", () => {
  test.each([new ChannelId("@example"), new ChannelId("UCQ78z42ZYZHLlCiDexample")])(
    "successfully fetch the channel page.",
    async (channelId) => {
      jest
        .spyOn(fetch, "fetchAsString")
        .mockImplementation(jest.fn(() => Promise.resolve("<html></html>")));

      const actual = await getChannelPage(channelId);

      expect(actual.type).toEqual("channel");
      expect(actual.channelId).toEqual(channelId);
      expect(actual.html).toEqual("<html></html>");
    },
  );

  test("check url passed to infrastructure layer, in case of Youtube handle.", async () => {
    jest
      .spyOn(fetch, "fetchAsString")
      .mockImplementation(jest.fn(() => Promise.resolve("<html></html>")));

    const actual = await getChannelPage(new ChannelId("@example"));

    expect(jest.mocked(fetch.fetchAsString).mock.calls[0][0]).toEqual(
      "https://www.youtube.com/@example",
    );
  });

  test("check url passed to infrastructure layer, in case of non Youtube handle.", async () => {
    jest
      .spyOn(fetch, "fetchAsString")
      .mockImplementation(jest.fn(() => Promise.resolve("<html></html>")));

    const actual = await getChannelPage(new ChannelId("UCQ78z42ZYZHLlCiDexample"));

    expect(jest.mocked(fetch.fetchAsString).mock.calls[0][0]).toEqual(
      "https://www.youtube.com/channel/UCQ78z42ZYZHLlCiDexample",
    );
  });
});

describe("getVideosPage", () => {
  test.each([new ChannelId("@example"), new ChannelId("UCQ78z42ZYZHLlCiDexample")])(
    "successfully fetch the videos page.",
    async (channelId) => {
      jest
        .spyOn(fetch, "fetchAsString")
        .mockImplementation(jest.fn(() => Promise.resolve("<html></html>")));

      const actual = await getVideosPage(channelId);

      expect(actual.type).toEqual("videos");
      expect(actual.channelId).toEqual(channelId);
      expect(actual.html).toEqual("<html></html>");
    },
  );

  test("check url passed to infrastructure layer, in case of Youtube handle.", async () => {
    jest
      .spyOn(fetch, "fetchAsString")
      .mockImplementation(jest.fn(() => Promise.resolve("<html></html>")));

    const actual = await getVideosPage(new ChannelId("@example"));

    expect(jest.mocked(fetch.fetchAsString).mock.calls[0][0]).toEqual(
      "https://www.youtube.com/@example/videos",
    );
  });

  test("check url passed to infrastructure layer, in case of non Youtube handle.", async () => {
    jest
      .spyOn(fetch, "fetchAsString")
      .mockImplementation(jest.fn(() => Promise.resolve("<html></html>")));

    const actual = await getVideosPage(new ChannelId("UCQ78z42ZYZHLlCiDexample"));

    expect(jest.mocked(fetch.fetchAsString).mock.calls[0][0]).toEqual(
      "https://www.youtube.com/channel/UCQ78z42ZYZHLlCiDexample/videos",
    );
  });
});

describe("getStreamsPage", () => {
  test.each([new ChannelId("@example"), new ChannelId("UCQ78z42ZYZHLlCiDexample")])(
    "successfully fetch the streams page.",
    async (channelId) => {
      jest
        .spyOn(fetch, "fetchAsString")
        .mockImplementation(jest.fn(() => Promise.resolve("<html></html>")));

      const actual = await getStreamsPage(channelId);

      expect(actual.type).toEqual("streams");
      expect(actual.channelId).toEqual(channelId);
      expect(actual.html).toEqual("<html></html>");
    },
  );

  test("check url passed to infrastructure layer, in case of Youtube handle.", async () => {
    jest
      .spyOn(fetch, "fetchAsString")
      .mockImplementation(jest.fn(() => Promise.resolve("<html></html>")));

    const actual = await getStreamsPage(new ChannelId("@example"));

    expect(jest.mocked(fetch.fetchAsString).mock.calls[0][0]).toEqual(
      "https://www.youtube.com/@example/streams",
    );
  });

  test("check url passed to infrastructure layer, in case of non Youtube handle.", async () => {
    jest
      .spyOn(fetch, "fetchAsString")
      .mockImplementation(jest.fn(() => Promise.resolve("<html></html>")));

    const actual = await getStreamsPage(new ChannelId("UCQ78z42ZYZHLlCiDexample"));

    expect(jest.mocked(fetch.fetchAsString).mock.calls[0][0]).toEqual(
      "https://www.youtube.com/channel/UCQ78z42ZYZHLlCiDexample/streams",
    );
  });
});
