export interface MediaAttachment {
  height: number;
  index: number | null;
  meta: {
    duration: number;
    size: number;
  };
  name: string;
  type: string;
  url: string;
  width: number;
}
