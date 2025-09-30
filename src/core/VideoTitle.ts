export class VideoTitle {
  readonly title: string;
  constructor(title: string) {
    if (title === "") {
      throw new Error("Video title is empty.");
    }
    if (title.length > 101) {
      throw new Error("Video title is too long.");
    }
    this.title = title;
  }
}
