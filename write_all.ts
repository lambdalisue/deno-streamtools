export type WriteAllOptions = {
  /** The size of each chunk to write to the stream */
  chunkSize?: number;
};

/**
 * Write all data from a Uint8Array to a writable stream.
 *
 * @param stream The stream to write to.
 * @param data The data to write.
 * @returns A promise that resolves when all the data has been written to the stream.
 */
export async function writeAll(
  stream: WritableStream<Uint8Array>,
  data: Uint8Array,
  options: WriteAllOptions = {},
): Promise<void> {
  const { chunkSize = 1024 } = options;
  const input = new ReadableStream({
    start(controller) {
      let offset = 0;
      while (offset < data.length) {
        controller.enqueue(data.subarray(offset, offset + chunkSize));
        offset += chunkSize;
      }
      controller.close();
    },
  });
  await input.pipeTo(stream);
}
