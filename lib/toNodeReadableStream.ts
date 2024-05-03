import { Readable } from "stream";

export function toNodeReadableStream(webStream: ReadableStream<Uint8Array>) {
  const reader = webStream.getReader();

  return new Readable({
    read() {
      reader.read().then(({ done, value }) => {
        if (done) {
          this.push(null); // End the Node.js stream
        } else {
          this.push(Buffer.from(value)); // Push data into the Node.js stream
        }
      });
    },
  });
}
